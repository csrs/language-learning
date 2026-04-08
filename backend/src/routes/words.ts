import { Router } from "express";
import { prisma } from "../../prisma/prisma.js";
import { z } from "zod";
import type { Language } from "@prisma/client";

export const router = Router();

const querySchema = z.object({
  numOfWords: z.string().optional(),
  language: z.string().min(2).max(2, { error: "Must be exactly 2 characters" }),
});

// GET /api/words?numOfWords=10&language=en
router.get("/", async (req, res) => {
  const parseResult = querySchema.safeParse(req.query);
  if (!parseResult.success) {
    const flattenedError = z.flattenError(parseResult.error);
    return res.status(400).json({
      formErrors: flattenedError.formErrors,
      fieldErrors: flattenedError.fieldErrors,
    });
  }
  const { numOfWords, language } = parseResult.data;
  try {
    const lang: Language | null = await prisma.language.findUnique({
      where: { value: language },
    });
    if (!lang) {
      return res
        .status(400)
        .json({ error: `Language '${language}' not found in database` });
    }

    const words = await prisma.word.findMany({
      where: { languageId: lang.id },
      ...(numOfWords ? { take: Number(numOfWords) } : {}),
      orderBy: { id: "asc" },
      select: {
        id: true,
        value: true,
        languageId: true,
        frequencyRank: true,
        meanings: {
          orderBy: { id: "asc" },
          take: 1,
          select: {
            exampleBase: true,
            exampleTarget: true,
            partOfSpeech: {
              select: {
                value: true,
              },
            },
            translations: {
              orderBy: { id: "asc" },
              take: 1,
              select: {
                toWord: {
                  select: {
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const response = words.map((word) => {
      const firstMeaning = word.meanings[0];
      const firstTranslation = firstMeaning?.translations[0];

      return {
        id: word.id,
        value: word.value,
        languageId: word.languageId,
        frequencyRank: word.frequencyRank,
        partOfSpeech: firstMeaning?.partOfSpeech.value ?? null,
        translation: firstTranslation?.toWord.value ?? null,
        exampleBase: firstMeaning?.exampleBase ?? null,
        exampleTarget: firstMeaning?.exampleTarget ?? null,
      };
    });

    res.json(response);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});
