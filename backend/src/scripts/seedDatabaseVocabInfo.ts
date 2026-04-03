import { prisma } from "../../prisma/prisma.ts";

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
