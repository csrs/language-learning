import { prisma } from "../../../prisma/prisma.js";
import { Prisma } from "@prisma/client";

import { createReadStream } from "fs";
import { pathToFileURL } from "url";
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

export interface BatchImportStats {
  processedRows: number;
  insertedBaseWords: number;
  insertedPartsOfSpeech: number;
  insertedTargetWords: number;
  insertedExampleSentences: number;
  insertedTranslations: number;
}

export interface ImportStats extends BatchImportStats {
  batchesProcessed: number;
}

const CLEAR_FIRST_FLAG = "--clear-first";
const RESET_IMPORT_TABLES_SQL = Prisma.sql`
  TRUNCATE TABLE "Translation", "ExampleSentence", "Word", "PartOfSpeech", "Language"
  RESTART IDENTITY
`;

const createEmptyImportStats = (): ImportStats => ({
  processedRows: 0,
  insertedBaseWords: 0,
  insertedPartsOfSpeech: 0,
  insertedTargetWords: 0,
  insertedExampleSentences: 0,
  insertedTranslations: 0,
  batchesProcessed: 0,
});

const addBatchStats = (totals: ImportStats, batchStats: BatchImportStats) => {
  totals.processedRows += batchStats.processedRows;
  totals.insertedBaseWords += batchStats.insertedBaseWords;
  totals.insertedPartsOfSpeech += batchStats.insertedPartsOfSpeech;
  totals.insertedTargetWords += batchStats.insertedTargetWords;
  totals.insertedExampleSentences += batchStats.insertedExampleSentences;
  totals.insertedTranslations += batchStats.insertedTranslations;
  totals.batchesProcessed += 1;
};

const logImportSummary = (stats: ImportStats, durationMs: number) => {
  const timePerRowMs =
    stats.processedRows > 0 ? durationMs / stats.processedRows : 0;

  console.log(
    `Processed ${stats.processedRows} rows in ${durationMs} ms (${timePerRowMs.toFixed(2)} ms/row) across ${stats.batchesProcessed} batch(es)`,
  );
  console.log(
    `Inserted ${stats.insertedBaseWords} base words, ${stats.insertedTargetWords} target words, ${stats.insertedPartsOfSpeech} parts of speech, ${stats.insertedExampleSentences} example sentences, and ${stats.insertedTranslations} translations.`,
  );
};

export const getShouldClearTables = (
  argv: string[] = process.argv.slice(2),
): boolean => argv.includes(CLEAR_FIRST_FLAG);

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
): Promise<BatchImportStats> => {
  console.log(`Processing batch #${batchNumber} (${rows.length} rows)`);
  let insertedBaseWords = 0;
  let insertedPartsOfSpeech = 0;
  let insertedTargetWords = 0;
  let insertedExampleSentences = 0;
  let insertedTranslations = 0;

  // 1. Batch insert base words
  if (rows.length > 0) {
    const result = await prisma.word.createMany({
      data: rows.map((r) => ({
        value: r.base_word,
        languageId: baseLang.id,
        frequencyRank: Number(r.id),
      })),
      skipDuplicates: true,
    });
    insertedBaseWords = result.count;
  }

  // 2. Batch insert unique parts of speech
  const uniquePartsOfSpeech = getUniquePartsOfSpeech(rows);
  if (uniquePartsOfSpeech && uniquePartsOfSpeech.length > 0) {
    const result = await prisma.partOfSpeech.createMany({
      data: uniquePartsOfSpeech.map((pos) => ({ value: pos })),
      skipDuplicates: true,
    });
    insertedPartsOfSpeech = result.count;
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
    const result = await prisma.word.createMany({
      data: uniqueTargetWords.map((w) => ({
        value: w,
        languageId: targetLang.id,
      })),
      skipDuplicates: true,
    });
    insertedTargetWords = result.count;
  }

  // Batch insert example sentences
  if (exampleSentences.length > 0) {
    const result = await prisma.exampleSentence.createMany({
      data: exampleSentences,
      skipDuplicates: true,
    });
    insertedExampleSentences = result.count;
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
    const result = await prisma.translation.createMany({
      data: translationRecords,
      skipDuplicates: true,
    });
    insertedTranslations = result.count;
  }

  return {
    processedRows: rows.length,
    insertedBaseWords,
    insertedPartsOfSpeech,
    insertedTargetWords,
    insertedExampleSentences,
    insertedTranslations,
  };
};

// Process the current batch
const handleBatch = async (
  currentBatch: RowSchema[],
  currentBatchNumber: number,
  baseLang: Language,
  targetLang: Language,
): Promise<BatchImportStats> => {
  try {
    return await addRowsToDatabase(
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

export const clearImportTables = async (): Promise<void> => {
  console.warn(
    "Clear-first mode enabled. Truncating Translation, ExampleSentence, Word, PartOfSpeech, and Language rows and resetting their identities before import.",
  );
  await prisma.$executeRaw(RESET_IMPORT_TABLES_SQL);
  console.log("Import tables cleared.");
};

// Reads the CSV file, processes in batches, and seeds the database
export const parseInputFile = async (): Promise<ImportStats> => {
  const BATCH_SIZE = 5000;
  const start = Date.now();
  const totals = createEmptyImportStats();

  try {
    const { baseLang, targetLang } = await seedLanguageTable("de", "en");
    const stream = createReadStream("./src/scripts/database/input.csv").pipe(
      parse({ columns: true, delimiter: "," }),
    );

    let currentBatch: RowSchema[] = [];
    let currentBatchNumber = 1;

    for await (const row of stream) {
      const result = RowSchema.safeParse(row);
      if (!result.success) {
        console.warn("Skipping invalid row:", row, result.error);
        continue;
      }

      currentBatch.push(result.data);

      if (currentBatch.length === BATCH_SIZE) {
        const batchStats = await handleBatch(
          currentBatch,
          currentBatchNumber,
          baseLang,
          targetLang,
        );
        addBatchStats(totals, batchStats);
        currentBatch = [];
        currentBatchNumber++;
      }
    }

    if (currentBatch.length > 0) {
      const batchStats = await handleBatch(
        currentBatch,
        currentBatchNumber,
        baseLang,
        targetLang,
      );
      addBatchStats(totals, batchStats);
    }

    console.log("CSV import complete");
    return totals;
  } finally {
    await prisma.$disconnect();
    console.log("Database disconnected");
    logImportSummary(totals, Date.now() - start);
  }
};

const isMainModule = (): boolean => {
  // https://nodejs.org/api/modules.html#accessing-the-main-module

  // process.argv is an array of command-line arguments. The first element is the path to the Node.js executable,
  // and the second element is the path to the JavaScript file being executed. If there is no second element,
  // it means the script is being run in a test environment or similar environment, so it returns false.
  // https://nodejs.org/download/release/latest-v24.x/docs/api/esm.html#importmetaurl
  const entryPoint = process.argv[1];

  if (!entryPoint) {
    return false;
  }

  // import.meta.url is defined exactly the same as it is in browsers providing the URL of the current module file.
  // https://nodejs.org/download/release/latest-v24.x/docs/api/esm.html#importmetaurl

  // pathToFileURL converts a filesystem path to a file URL. We compare this to import.meta.url to determine if this module is the entry point.
  // https://nodejs.org/api/url.html#urlpathtofileurlpath-options
  return import.meta.url === pathToFileURL(entryPoint).href;
};

if (isMainModule()) {
  const shouldClearTables = getShouldClearTables();

  console.log(
    `Starting Anki import. Clear-first mode: ${shouldClearTables ? "enabled" : "disabled"}.`,
  );

  try {
    if (shouldClearTables) {
      await clearImportTables();
    }

    await parseInputFile();
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  }
}
