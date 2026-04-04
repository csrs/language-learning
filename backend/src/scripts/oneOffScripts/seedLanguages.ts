import { type Language } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.ts";

export interface LanguageTable {
  baseLang: Language;
  targetLang: Language;
}

export const seedLanguageTable = async (
  lang1: string,
  lang2: string,
): Promise<LanguageTable> => {
  try {
    const baseLang: Language = await prisma.language.upsert({
      // 'upsert' updates an existing row or inserts a new one if it doesn’t exist
      where: { value: lang1 },
      update: {},
      create: { value: lang1 },
    });
    const targetLang: Language = await prisma.language.upsert({
      where: { value: lang2 },
      update: {},
      create: { value: lang2 },
    });
    console.log(
      `Languages seeded: ${lang1}(${baseLang.id}), ${lang2}(${targetLang.id})`,
    );
    return { baseLang, targetLang };
  } catch (err) {
    console.error("Error seeding Language table: ", err);
    throw err;
  }
};
