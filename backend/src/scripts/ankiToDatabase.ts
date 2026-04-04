import { prisma } from "../../prisma/prisma.js";

import { createReadStream } from "fs";
import { parse } from "csv-parse";
import type {
  ExampleSentence,
  Language,
  PartOfSpeech,
  Word,
} from "@prisma/client";
import z from "zod";
import { normalizeVerbsToInfinitive } from "../utils/stringUtils.ts";
import { seedLanguageTable } from "./oneOffScripts/seedLanguages.ts";

const posMap = new Map<string, number>();

const RowSchema = z.object({
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

type RowSchema = z.infer<typeof RowSchema>;

async function addRowsToDatabase(
  rows: RowSchema[],
  batchNumber: number,
  baseLang: Language,
  targetLang: Language,
) {
  console.log(`Processing batch #${batchNumber} (${rows.length} rows)`);
  for (const row of rows) {
    // 1. Insert or update the base word
    const baseWord: Word = await prisma.word.createMany({
      where: {
        value_languageId: {
          value: row.base_word,
          languageId: baseLang.id,
        },
      },
      update: {},
      create: {
        value: row.base_word,
        languageId: baseLang.id,
        frequencyRank: Number(row.id),
      },
    });

    // 2. For each translation set (up to 3)
    for (let i = 1; i <= 3; i++) {
      const key1 = `target_part_of_speech_${i}` as keyof RowSchema;
      const pos = row[key1];
      const key2 = `base_sentence_${i}` as keyof RowSchema;
      const baseSentence = row[key2];
      const key3 = `target_sentence_${i}` as keyof RowSchema;
      const targetSentence = row[key3];
      if (!pos || !baseSentence || !targetSentence) {
        continue;
      }

      if (pos && !pos.includes("(")) {
        let posId = posMap.get(pos);
        if (posId === undefined) {
          // Insert or upsert POS in the database
          const record: PartOfSpeech = await prisma.partOfSpeech.upsert({
            where: { value: pos },
            update: {},
            create: { value: pos },
          });
          posId = record.id;
          posMap.set(pos, posId);
        }
        // 3. Create ExampleSentence (meaning) for this word and POS
        const exampleSentence: ExampleSentence =
          await prisma.exampleSentence.create({
            data: {
              wordId: baseWord.id,
              partOfSpeechId: posId,
              exampleTarget: baseSentence,
              exampleBase: targetSentence,
            },
          });

        // After creating the ExampleSentence (meaning) for the base word:
        // Insert the corresponding word in the target language
        const key4 = `target_word_${i}` as keyof RowSchema;
        let targetWordString = row[key4];
        if (
          !targetWordString ||
          targetWordString === "(past tense)" ||
          targetWordString === "(future tense)" ||
          targetWordString === "(passive voice)" ||
          targetWordString === "(Reflexive pronoun in the acc.)"
        ) {
          continue;
        }
        if (pos === "verb") {
          targetWordString = normalizeVerbsToInfinitive(targetWordString);
        }
        const targetWord: Word = await prisma.word.upsert({
          where: {
            value_languageId: {
              value: targetWordString,
              languageId: targetLang.id,
            },
          },
          update: {},
          create: {
            value: targetWordString,
            languageId: targetLang.id,
          },
        });

        await prisma.translation.create({
          data: {
            exampleSentenceId: exampleSentence.id, // the example sentence that was created in Step 3
            toWordId: targetWord.id, // the translated word
          },
        });
      }
    }
  }
}

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
    currentBatch = [];
    currentBatchNumber++;
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
        const stream = createReadStream("./src/scripts/input.csv").pipe(
          parse({ columns: true, delimiter: "," }),
        );

        const BATCH_SIZE = 100;
        let currentBatch: RowSchema[] = [];
        let currentBatchNumber = 1;

        // Collect rows into batches as they are read

        const start = Date.now();
        let totalRowsProcessed = 0;

        stream.on("data", (row) => {
          currentBatch.push(row);
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
