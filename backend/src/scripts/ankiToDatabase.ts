import { prisma } from "../../prisma/prisma.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

interface JsonExample {
  target: string;
  base: string;
}

interface JsonMeaning {
  part_of_speech: string;
  translations: string[];
  examples: JsonExample[];
}

interface JsonEntry {
  id: string;
  target_word: string;
  base_language: string;
  target_language: string;
  meanings: JsonMeaning[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  const raw = readFileSync(join(__dirname, "output.json"), "utf-8");
  const entries: JsonEntry[] = JSON.parse(raw);

  console.log(`Loaded ${entries.length} entries from output.json`);

  // 1. Seed languages
  const deLang = await prisma.language.upsert({
    where: { value: "de" },
    update: {},
    create: { value: "de" },
  });
  const enLang = await prisma.language.upsert({
    where: { value: "en" },
    update: {},
    create: { value: "en" },
  });
  console.log(`Languages seeded: de(${deLang.id}), en(${enLang.id})`);

  // 2. Seed parts of speech
  const posValues = [
    "adj",
    "adv",
    "verb",
    "noun",
    "prep",
    "conj",
    "pron",
    "art",
    "aux",
  ];
  const posMap = new Map<string, number>();
  for (const pos of posValues) {
    const record = await prisma.partOfSpeech.upsert({
      where: { value: pos },
      update: {},
      create: { value: pos },
    });
    posMap.set(pos, record.id);
  }
  console.log(`Parts of speech seeded: ${posMap.size} values`);

  // 3. Cache for English words: "value" -> Word.id
  const enWordCache = new Map<string, number>();

  // Process entries in batches using transactions
  const BATCH_SIZE = 100;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    await prisma.$transaction(async (tx) => {
      for (const entry of batch) {
        // Create the German (target) word
        const deWord = await tx.word.upsert({
          where: {
            value_languageId: {
              value: entry.target_word,
              languageId: deLang.id,
            },
          },
          update: {},
          create: {
            value: entry.target_word,
            languageId: deLang.id,
          },
        });

        // Process each meaning
        for (const meaning of entry.meanings) {
          const posId = posMap.get(meaning.part_of_speech);
          if (posId === undefined) {
            console.warn(
              `Unknown POS "${meaning.part_of_speech}" for word "${entry.target_word}", skipping meaning`,
            );
            continue;
          }

          const exampleTarget = meaning.examples[0]?.target ?? "";
          const exampleBase = meaning.examples[0]?.base ?? "";

          // Create WordMeaning
          const wordMeaning = await tx.wordMeaning.create({
            data: {
              wordId: deWord.id,
              partOfSpeechId: posId,
              exampleTarget,
              exampleBase,
            },
          });

          // Create English translation words + Translation rows
          for (const translationValue of meaning.translations) {
            let enWordId = enWordCache.get(translationValue);

            if (enWordId === undefined) {
              const enWord = await tx.word.upsert({
                where: {
                  value_languageId: {
                    value: translationValue,
                    languageId: enLang.id,
                  },
                },
                update: {},
                create: {
                  value: translationValue,
                  languageId: enLang.id,
                },
              });
              enWordId = enWord.id;
              enWordCache.set(translationValue, enWordId);
            }

            await tx.translation.upsert({
              where: {
                wordMeaningId_toWordId: {
                  wordMeaningId: wordMeaning.id,
                  toWordId: enWordId,
                },
              },
              update: {},
              create: {
                wordMeaningId: wordMeaning.id,
                toWordId: enWordId,
              },
            });
          }
        }
      }
    });

    console.log(
      `Processed ${Math.min(i + BATCH_SIZE, entries.length)} / ${entries.length}`,
    );
  }

  // Print summary
  const [wordCount, meaningCount, translationCount, enWordCount] =
    await Promise.all([
      prisma.word.count({ where: { languageId: deLang.id } }),
      prisma.wordMeaning.count(),
      prisma.translation.count(),
      prisma.word.count({ where: { languageId: enLang.id } }),
    ]);

  console.log(`\nDone!`);
  console.log(`  German words:   ${wordCount}`);
  console.log(`  English words:  ${enWordCount}`);
  console.log(`  Word meanings:  ${meaningCount}`);
  console.log(`  Translations:   ${translationCount}`);
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
