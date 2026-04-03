import { prisma } from "../../prisma/prisma.js";

import { createReadStream } from "fs";
import { parse } from "csv-parse";
import type {
  ExampleSentence,
  Language,
  PartOfSpeech,
  Word,
} from "@prisma/client";

const POS_TAGS = new Set([
  "adj",
  "adv",
  "verb",
  "der",
  "das",
  "die",
  "die (pl)",
  "prep",
  "conj",
  "pron",
  "art",
  "aux",
  "part",
  "num",
  "der, das",
]);
const posMap = new Map<string, number>();

const baseLanguage = "de";
const targetLanguage = "en";

export const normalizeVerbsToInfinitive = (input: string): string => {
  return input
    .split(",")
    .map((verb) => {
      const trimmed = verb.trim();
      return trimmed.startsWith("to ") ? trimmed : "to " + trimmed;
    })
    .join(", ");
};

async function processBatch(
  rows: any[],
  batchNumber: number,
  baseLang: Language,
  targetLang: Language,
) {
  console.log(`Processing batch #${batchNumber} (${rows.length} rows)`);
  for (const row of rows) {
    // 1. Insert or update the base word
    const word: Word = await prisma.word.upsert({
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
        frequencyCount: Number(row.id),
      },
    });

    // 2. For each translation set (up to 3)
    for (let i = 1; i <= 3; i++) {
      const pos = row[`target_part_of_speech_${i}`];
      const baseSentence = row[`base_sentence_${i}`];
      const targetSentence = row[`target_sentence_${i}`];
      if (!pos && !baseSentence && !targetSentence) {
        continue;
      }

      const posId = posMap.get(pos);
      if (posId === undefined) {
        continue;
      }

      // 3. Create ExampleSentence (meaning) for this word and POS
      const exampleSentence: ExampleSentence =
        await prisma.exampleSentence.create({
          data: {
            wordId: word.id,
            partOfSpeechId: posId,
            exampleTarget: baseSentence,
            exampleBase: targetSentence,
          },
        });

      // After creating the ExampleSentence (meaning) for the base word:
      // Insert the corresponding word in the target language
      let targetWord = row[`target_word_${i}`];
      if (
        targetWord === "(past tense)" ||
        targetWord === "(future tense)" ||
        targetWord === "(passive voice)" ||
        targetWord === "(Reflexive pronoun in the acc.)"
      ) {
        continue;
      }
      if (pos === "verb") {
        targetWord = normalizeVerbsToInfinitive(targetWord);
      }
      const translationWord: Word = await prisma.word.upsert({
        where: {
          value_languageId: {
            value: targetWord,
            languageId: targetLang.id,
          },
        },
        update: {},
        create: {
          value: targetWord,
          languageId: targetLang.id,
        },
      });

      await prisma.translation.create({
        data: {
          exampleSentenceId: exampleSentence.id, // the example sentence that was created in Step 3
          toWordId: translationWord.id, // the translated word
        },
      });
    }
  }
}

// Reads the CSV file, processes in batches, and seeds the database
const parseInputFile = async () => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      try {
        // 1. Seed languages
        const baseLang: Language = await prisma.language.upsert({
          where: { value: baseLanguage },
          update: {},
          create: { value: baseLanguage },
        });
        const targetLang: Language = await prisma.language.upsert({
          where: { value: targetLanguage },
          update: {},
          create: { value: targetLanguage },
        });
        console.log(
          `Languages seeded: ${baseLanguage}(${baseLang.id}), ${targetLanguage}(${targetLang.id})`,
        );

        // 2. Seed parts of speech
        const posValues = [...POS_TAGS];
        for (const pos of posValues) {
          const record: PartOfSpeech = await prisma.partOfSpeech.upsert({
            where: { value: pos },
            update: {},
            create: { value: pos },
          });
          posMap.set(pos, record.id);
        }

        // 3. Prepare to read and process the CSV in batches
        const stream = createReadStream("./src/scripts/input.csv").pipe(
          parse({ columns: true, delimiter: "," }),
        );

        const BATCH_SIZE = 100;
        let currentBatch: any[] = [];
        let currentBatchNumber = 1;

        // Helper to process and clear the current batch
        async function handleBatch() {
          try {
            await processBatch(
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
        }

        // Collect rows into batches as they are read
        stream.on("data", (row) => {
          currentBatch.push(row);
          // If batch is full, process it
          if (currentBatch.length === BATCH_SIZE) {
            stream.pause();
            handleBatch()
              .then(() => stream.resume())
              .catch((err) => {
                stream.destroy();
                reject(err);
              });
          }
        });

        // When the stream ends, process any remaining rows in the last batch
        stream.on("end", async () => {
          try {
            if (currentBatch.length > 0) {
              await handleBatch();
            }
            console.log("CSV import complete");
          } catch (err) {
            reject(err);
          }
        });

        // Clean up and disconnect from the database
        stream.on("close", async () => {
          try {
            console.log("Stream closed");
            await prisma.$disconnect();
            resolve();
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
async function seed() {
  await parseInputFile();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
