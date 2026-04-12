import { Router } from "express";
import { prisma } from "../../prisma/prisma.js";
import { z } from "zod";
import type { Language } from "@prisma/client";

export const router = Router();

type LookupLanguage = "de" | "en";

interface WordDetailsLanguageResponse {
  id: number;
  value: string;
}

interface WordDetailsTargetWordResponse {
  id: number;
  value: string;
  frequencyRank: number | null;
  language: WordDetailsLanguageResponse;
}

interface WordDetailsTranslationResponse {
  id: number;
  toWord: WordDetailsTargetWordResponse;
}

interface WordDetailsPartOfSpeechResponse {
  id: number;
  value: string;
}

interface WordDetailsMeaningResponse {
  id: number;
  exampleBase: string;
  exampleTarget: string;
  partOfSpeech: WordDetailsPartOfSpeechResponse;
  translations: WordDetailsTranslationResponse[];
}

interface WordDetailsResponse {
  id: number;
  value: string;
  frequencyRank: number | null;
  language: WordDetailsLanguageResponse;
  meanings: WordDetailsMeaningResponse[];
}

const getDetailsByValueRequestSchema = z.object({
  word: z.string().trim().min(1, { error: "Must be at least one character" }),
  language: z.enum(["de", "en"]),
});

const wordListSelect = {
  id: true,
  value: true,
  languageId: true,
  frequencyRank: true,
  meanings: {
    orderBy: { id: "asc" as const },
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
        orderBy: { id: "asc" as const },
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
};

const wordDetailSelect = {
  id: true,
  value: true,
  frequencyRank: true,
  language: {
    select: {
      id: true,
      value: true,
    },
  },
  meanings: {
    orderBy: { id: "asc" as const },
    select: {
      id: true,
      exampleBase: true,
      exampleTarget: true,
      partOfSpeech: {
        select: {
          id: true,
          value: true,
        },
      },
      translations: {
        orderBy: { id: "asc" as const },
        select: {
          id: true,
          toWord: {
            select: {
              id: true,
              value: true,
              frequencyRank: true,
              language: {
                select: {
                  id: true,
                  value: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

const getSearchFilters = (searchValue: string) => [
  { equals: searchValue, mode: "insensitive" as const },
  { startsWith: searchValue, mode: "insensitive" as const },
  { contains: searchValue, mode: "insensitive" as const },
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const hasWholeTokenMatch = (candidate: string, searchValue: string) => {
  const pattern = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escapeRegExp(searchValue)}(?=$|[^\\p{L}\\p{N}])`,
    "iu",
  );

  return pattern.test(candidate);
};

export const sortWordDetailMatches = (
  matches: WordDetailsResponse[],
): WordDetailsResponse[] => {
  return [...matches]
    .sort((left, right) => left.id - right.id)
    .map((word) => ({
      ...word,
      meanings: [...word.meanings]
        .sort((left, right) => left.id - right.id)
        .map((meaning) => ({
          ...meaning,
          translations: [...meaning.translations].sort(
            (left, right) => left.id - right.id,
          ),
        })),
    }));
};

const getLanguageByValue = async (
  language: LookupLanguage,
): Promise<Language | null> => {
  return prisma.language.findUnique({
    where: { value: language },
  });
};

const getGermanWordDetailsBySearchValue = async (
  languageId: number,
  searchValue: string,
): Promise<WordDetailsResponse[]> => {
  for (const valueFilter of getSearchFilters(searchValue)) {
    const wordData = await prisma.word.findMany({
      where: {
        languageId,
        value: valueFilter,
      },
      orderBy: { id: "asc" },
      select: wordDetailSelect,
    });

    const filteredWordData = wordData.filter((word) =>
      hasWholeTokenMatch(word.value, searchValue),
    );

    if (filteredWordData.length > 0) {
      return sortWordDetailMatches(filteredWordData);
    }
  }

  return [];
};

const getEnglishMatchesBySearchValue = async (
  languageId: number,
  germanLanguageId: number,
  searchValue: string,
) => {
  for (const valueFilter of getSearchFilters(searchValue)) {
    const wordData = await prisma.word.findMany({
      where: {
        languageId,
        value: valueFilter,
        translationsTo: {
          some: {
            exampleSentence: {
              word: {
                languageId: germanLanguageId,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
      select: {
        id: true,
        value: true,
        frequencyRank: true,
        language: {
          select: {
            id: true,
            value: true,
          },
        },
        translationsTo: {
          where: {
            exampleSentence: {
              word: {
                languageId: germanLanguageId,
              },
            },
          },
          orderBy: { id: "asc" as const },
          select: {
            id: true,
            exampleSentence: {
              select: {
                id: true,
                exampleBase: true,
                exampleTarget: true,
                partOfSpeech: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
                word: {
                  select: {
                    id: true,
                    value: true,
                    frequencyRank: true,
                    language: {
                      select: {
                        id: true,
                        value: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const filteredWordData = wordData.filter((word) =>
      hasWholeTokenMatch(word.value, searchValue),
    );

    if (filteredWordData.length > 0) {
      return filteredWordData;
    }
  }

  return [];
};

const mapEnglishMatchesToGermanWordDetails = (
  englishMatches: Awaited<ReturnType<typeof getEnglishMatchesBySearchValue>>,
): WordDetailsResponse[] => {
  const germanWordsById = new Map<number, WordDetailsResponse>();

  for (const englishWord of englishMatches) {
    for (const translation of englishWord.translationsTo) {
      const meaning = translation.exampleSentence;
      const germanWord = meaning.word;
      const existingWord = germanWordsById.get(germanWord.id);

      const germanWordMatch =
        existingWord ??
        ({
          id: germanWord.id,
          value: germanWord.value,
          frequencyRank: germanWord.frequencyRank,
          language: germanWord.language,
          meanings: [],
        } satisfies WordDetailsResponse);

      if (!existingWord) {
        germanWordsById.set(germanWord.id, germanWordMatch);
      }

      let existingMeaning = germanWordMatch.meanings.find(
        (item) => item.id === meaning.id,
      );

      if (!existingMeaning) {
        existingMeaning = {
          id: meaning.id,
          exampleBase: meaning.exampleBase,
          exampleTarget: meaning.exampleTarget,
          partOfSpeech: meaning.partOfSpeech,
          translations: [],
        };
        germanWordMatch.meanings.push(existingMeaning);
      }

      existingMeaning.translations.push({
        id: translation.id,
        toWord: {
          id: englishWord.id,
          value: englishWord.value,
          frequencyRank: englishWord.frequencyRank,
          language: englishWord.language,
        },
      });
    }
  }

  return sortWordDetailMatches(Array.from(germanWordsById.values()));
};

// GET /api/words/all
router.get("/all", async (_req, res) => {
  void _req;
  try {
    const lang: Language | null = await prisma.language.findUnique({
      where: { value: "de" },
    });
    if (!lang) {
      return res
        .status(500)
        .json({ error: `Language 'de' not found in database` });
    }

    const words = await prisma.word.findMany({
      where: { languageId: lang.id },
      orderBy: { frequencyRank: "asc" },
      select: wordListSelect,
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

    return res.json(response);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/words?word={word}&language=de|en
// return German word detail matches for either direct German search or reverse English lookup
router.get("/", async (req, res) => {
  const parseResult = getDetailsByValueRequestSchema.safeParse({
    word: req.query.word,
    language: req.query.language,
  });
  if (!parseResult.success) {
    const flattenedError = z.flattenError(parseResult.error);
    return res.status(400).json({
      formErrors: flattenedError.formErrors,
      fieldErrors: flattenedError.fieldErrors,
    });
  }

  const { word, language } = parseResult.data;
  const searchValue = word.trim();

  try {
    const searchLanguage = await getLanguageByValue(language);

    if (!searchLanguage) {
      return res
        .status(400)
        .json({ error: `Language '${language}' not found in database` });
    }

    if (language === "de") {
      const germanMatches = await getGermanWordDetailsBySearchValue(
        searchLanguage.id,
        searchValue,
      );

      if (germanMatches.length === 0) {
        return res.status(404).json({
          error: `Word matching '${searchValue}' not found for language '${language}'`,
        });
      }

      return res.json(germanMatches);
    }

    const germanLanguage = await getLanguageByValue("de");

    if (!germanLanguage) {
      return res
        .status(400)
        .json({ error: "Language 'de' not found in database" });
    }

    const englishMatches = await getEnglishMatchesBySearchValue(
      searchLanguage.id,
      germanLanguage.id,
      searchValue,
    );
    const germanMatches = mapEnglishMatchesToGermanWordDetails(englishMatches);

    if (germanMatches.length === 0) {
      return res.status(404).json({
        error: `Word matching '${searchValue}' not found for language '${language}'`,
      });
    }

    return res.json(germanMatches);
  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});
