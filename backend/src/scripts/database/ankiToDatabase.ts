import { prisma } from "../../../prisma/prisma.js";

import { createReadStream } from "fs";
import { parse } from "csv-parse";
import type {
  ExampleSentence,
  Language,
  PartOfSpeech,
  Translation,
  Word,
} from "@prisma/client";
import z from "zod";
import { seedLanguageTable } from "./seedLanguages.js";

export const RowSchema = z.object({
  id: z.string(),
  base_word: z.string(),
  target_part_of_speech_1: z.string(),
  target_word_1: z.string(),
  base_sentence_1: z.string(),
  target_sentence_1: z.string(),
  target_part_of_speech_2: z.string().optional(),
  target_word_2: z.string().optional(),
  base_sentence_2: z.string().optional(),
  target_sentence_2: z.string().optional(),
  target_part_of_speech_3: z.string().optional(),
  target_word_3: z.string().optional(),
  base_sentence_3: z.string().optional(),
  target_sentence_3: z.string().optional(),
});

export type RowSchema = z.infer<typeof RowSchema>;

export const getUniquePartsOfSpeech = (
  rows: RowSchema[],
): string[] | undefined => {
  // Collect all parts of speech from all rows into a flat array
  const allPartsOfSpeech = rows.flatMap((r) => [
    r.target_part_of_speech_1,
    r.target_part_of_speech_2,
    r.target_part_of_speech_3,
  ]);

  // Filter out any invalid or falsey values
  const filteredPartsOfSpeech: string[] = allPartsOfSpeech
    .filter((pos) => pos !== "(Reflexive pronoun in the acc.)")
    .filter((pos): pos is string => Boolean(pos));

  // Create a set to get unique values, then convert back to array
  const uniquePartsOfSpeech = Array.from(new Set(filteredPartsOfSpeech));

  return uniquePartsOfSpeech.length > 0 ? uniquePartsOfSpeech : undefined;
};

export const normalizeVerbsToInfinitive = (input: string): string => {
  return input
    .split(",")
    .map((verb) => {
      const trimmed = verb.trim();
      return trimmed.startsWith("to ") ? trimmed : "to " + trimmed;
    })
    .join(", ");
};

export const addRowsToDatabase = async (
  rows: RowSchema[],
  batchNumber: number,
  baseLang: Language,
  targetLang: Language,
) => {
  console.log(`Processing batch #${batchNumber} (${rows.length} rows)`);
  // 1. Batch insert base words
  if (rows.length > 0) {
    await prisma.word.createMany({
      data: rows.map((r) => ({
        value: r.base_word,
        languageId: baseLang.id,
        frequencyRank: Number(r.id),
      })),
      skipDuplicates: true,
    });
  }

  // 2. Batch insert unique parts of speech
  const uniquePartsOfSpeech = getUniquePartsOfSpeech(rows);
  if (uniquePartsOfSpeech && uniquePartsOfSpeech.length > 0) {
    await prisma.partOfSpeech.createMany({
      data: uniquePartsOfSpeech.map((pos) => ({ value: pos })),
      skipDuplicates: true,
    });
  }

  // 3. Get all words and parts of speech from DB to resolve IDs
  const allWords: Word[] = await prisma.word.findMany({
    where: { languageId: baseLang.id },
  });
  const allPartsOfSpeech: PartOfSpeech[] = await prisma.partOfSpeech.findMany();

  // 4. Prepare example sentences for batch insert
  const exampleSentences: Omit<ExampleSentence, "id">[] = [];
  const targetWords: string[] = [];
  for (const r of rows) {
    for (let i = 1; i <= 3; i++) {
      const pos = r[`target_part_of_speech_${i}` as keyof RowSchema];
      const baseSentence = r[`base_sentence_${i}` as keyof RowSchema];
      const targetSentence = r[`target_sentence_${i}` as keyof RowSchema];
      if (!pos || !baseSentence || !targetSentence) continue;
      // Find wordId and partOfSpeechId
      const word = allWords.find((w) => w.value === r.base_word);
      const partOfSpeech = allPartsOfSpeech.find((p) => p.value === pos);
      if (!word || !partOfSpeech) continue;
      exampleSentences.push({
        wordId: word.id,
        partOfSpeechId: partOfSpeech.id,
        exampleTarget: baseSentence,
        exampleBase: targetSentence,
      });

      // After creating the ExampleSentence (meaning) for the base word:
      // Collect the corresponding word in the target language
      const key4 = `target_word_${i}` as keyof RowSchema;
      let targetWordString = r[key4];
      if (
        !targetWordString ||
        targetWordString === "(past tense)" ||
        targetWordString === "(future tense)" ||
        targetWordString === "(passive voice)"
      ) {
        continue;
      }
      if (pos === "verb") {
        targetWordString = normalizeVerbsToInfinitive(targetWordString);
      }
      targetWords.push(targetWordString);
    }
  }

  // After the loop, batch insert unique target words
  const uniqueTargetWords = [...new Set(targetWords)];
  if (uniqueTargetWords.length > 0) {
    await prisma.word.createMany({
      data: uniqueTargetWords.map((w) => ({
        value: w,
        languageId: targetLang.id,
      })),
      skipDuplicates: true,
    });
  }

  // Batch insert example sentences
  if (exampleSentences.length > 0) {
    await prisma.exampleSentence.createMany({
      data: exampleSentences,
      skipDuplicates: true,
    });
  }

  // 5. Insert translation records linking example sentences and target words
  const allExampleSentences: ExampleSentence[] =
    await prisma.exampleSentence.findMany();
  const allTargetWords: Word[] = await prisma.word.findMany({
    where: { languageId: targetLang.id },
  });

  // Prepare translation records
  const translationRecords: Omit<Translation, "id">[] = [];
  for (const r of rows) {
    for (let i = 1; i <= 3; i++) {
      const pos = r[`target_part_of_speech_${i}` as keyof RowSchema];
      const baseSentence = r[`base_sentence_${i}` as keyof RowSchema];
      const targetSentence = r[`target_sentence_${i}` as keyof RowSchema];
      const key4 = `target_word_${i}` as keyof RowSchema;
      let targetWordString = r[key4];
      if (
        !pos ||
        !baseSentence ||
        !targetSentence ||
        !targetWordString ||
        targetWordString === "(past tense)" ||
        targetWordString === "(future tense)" ||
        targetWordString === "(passive voice)"
      ) {
        continue;
      }
      if (pos === "verb") {
        targetWordString = normalizeVerbsToInfinitive(targetWordString);
      }
      // Find the example sentence by matching fields
      const exampleSentence = allExampleSentences.find(
        (e) =>
          e.exampleTarget === baseSentence &&
          e.exampleBase === targetSentence &&
          allWords.find((w) => w.id === e.wordId)?.value === r.base_word &&
          allPartsOfSpeech.find((p) => p.id === e.partOfSpeechId)?.value ===
            pos,
      );

      // Find the target word by matching fields
      const targetWord = allTargetWords.find(
        (w) => w.value === targetWordString,
      );
      if (exampleSentence && targetWord) {
        translationRecords.push({
          exampleSentenceId: exampleSentence.id,
          toWordId: targetWord.id,
        });
      }
    }
  }

  if (translationRecords.length > 0) {
    await prisma.translation.createMany({
      data: translationRecords,
      skipDuplicates: true,
    });
  }
};

// Process the current batch
const handleBatch = async (
  currentBatch: RowSchema[],
  currentBatchNumber: number,
  baseLang: Language,
  targetLang: Language,
) => {
  try {
    await addRowsToDatabase(
      currentBatch,
      currentBatchNumber,
      baseLang,
      targetLang,
    );
  } catch (err) {
    console.error("Error processing batch:", err);
    throw err;
  }
};

// Reads the CSV file, processes in batches, and seeds the database
const parseInputFile = async () => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        const { baseLang, targetLang } = await seedLanguageTable("de", "en");

        // 3. Prepare to read and process the CSV in batches
        const stream = createReadStream(
          "./src/scripts/database/input.csv",
        ).pipe(parse({ columns: true, delimiter: "," }));

        const BATCH_SIZE = 5000;
        let currentBatch: RowSchema[] = [];
        let currentBatchNumber = 1;

        // Collect rows into batches as they are read

        const start = Date.now();
        let totalRowsProcessed = 0;

        stream.on("data", (row) => {
          const result = RowSchema.safeParse(row);
          if (!result.success) {
            console.warn("Skipping invalid row:", row, result.error);
            return;
          }
          currentBatch.push(result.data);
          // If batch is full, process it
          if (currentBatch.length === BATCH_SIZE) {
            stream.pause();

            handleBatch(currentBatch, currentBatchNumber, baseLang, targetLang)
              .then(() => {
                totalRowsProcessed += currentBatch.length;
                currentBatch = [];
                currentBatchNumber++;
                stream.resume();
              })
              .catch((err) => {
                stream.destroy();
                reject(err);
              });
          }
        });

        // When the stream ends, process any remaining rows in the last batch
        stream.on("end", async () => {
          if (currentBatch.length > 0) {
            try {
              await handleBatch(
                currentBatch,
                currentBatchNumber,
                baseLang,
                targetLang,
              );
              totalRowsProcessed += currentBatch.length;
              console.log("CSV import complete");
            } catch (err) {
              console.error(err);
              reject(err);
            }
          }
        });

        // Clean up and disconnect from the database
        stream.on("close", async () => {
          try {
            await prisma.$disconnect();
            resolve();
            console.log("Stream closed");
            const end = Date.now();
            const durationMs = end - start;
            const timePerRowMs = durationMs / totalRowsProcessed;
            console.log(
              `Processed ${totalRowsProcessed} rows in ${durationMs} ms (${timePerRowMs.toFixed(2)} ms/row)`,
            );
          } catch (err) {
            reject(err);
          }
        });

        // Handle errors
        stream.on("error", (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    })().catch(reject);
  });
};

const seed = async () => {
  await parseInputFile();
};

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
