import { prisma } from "../../prisma/prisma.js";

import { createReadStream } from "fs";
import { parse } from "csv-parse";

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
]);
const posMap = new Map<string, number>();

const baseLanguage = "de";
const targetLanguage = "en";

// todo: utilize this
const normalizeTargetLanguageVerbs = (translations: string[]): string[] => {
  return translations.map((t) => {
    t = t.trim();
    return t.toLowerCase().startsWith("to ") ? t : "to " + t;
  });
};

const parseInputFile = async () => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      // 1. Seed languages
      const baseLang = await prisma.language.upsert({
        where: { value: baseLanguage },
        update: {},
        create: { value: baseLanguage },
      });
      const targetLang = await prisma.language.upsert({
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
        const record = await prisma.partOfSpeech.upsert({
          where: { value: pos },
          update: {},
          create: { value: pos },
        });
        posMap.set(pos, record.id);
      }
      console.log(`Parts of speech seeded: ${posMap.size} values`);

      const stream = createReadStream("./src/scripts/input.csv").pipe(
        parse({ columns: true, delimiter: "," }),
      );

      let count = 0;
      stream.on("data", async (row) => {
        stream.pause();
        // todo: remove this count
        if (count < 227) {
          count++;

          // 1. Insert or update the base word
          const word = await prisma.word.upsert({
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
            },
          });

          // 2. For each translation set (up to 3)
          for (let i = 1; i <= 3; i++) {
            const pos = row[`target_part_of_speech_${i}`];
            const baseSentence = row[`base_sentence_${i}`];
            const targetSentence = row[`target_sentence_${i}`];
            if (!pos || !baseSentence || !targetSentence) continue;

            const posId = posMap.get(pos);
            if (!posId) continue;

            // 3. Create ExampleSentence (meaning) for this word and POS
            const exampleSentence = await prisma.exampleSentence.create({
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
            if (targetWord === "(past tense)") {
              targetWord = `past tense of "${row.base_word}"`;
            } else if (targetWord === "(future tense)") {
              targetWord = `future tense of "${row.base_word}"`;
            } else if (targetWord === "(passive voice)") {
              targetWord = `passive voice for "${row.base_word}"`;
            }
            const translationWord = await prisma.word.upsert({
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
                exampleSentenceId: exampleSentence.id, // the meaning you just created
                toWordId: translationWord.id, // the translated word
              },
            });
          }

          if (count === 227) {
            stream.destroy();
            return;
          }
        }
        stream.resume();
      });
      stream.on("end", () => {
        console.log("CSV import complete");
      });
      stream.on("close", async () => {
        console.log("Stream closed after 227 rows");
        await prisma.$disconnect();
        resolve();
      });
      stream.on("error", (err) => {
        reject(err);
      });
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
