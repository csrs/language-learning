import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../../app.js";
import { prisma } from "../../../prisma/prisma.js";
import { hasWholeTokenMatch, sortWordDetailMatches } from "../words.js";
import { getJson } from "../../utils/testUtils.js";

vi.mock("../../../prisma/prisma", () => ({
  prisma: {
    language: {
      findUnique: vi.fn(),
    },
    word: {
      findMany: vi.fn(),
    },
  },
}));

const prismaMock = vi.mocked(prisma, { deep: true });

let server: Server;
let baseUrl: string;

beforeEach(async () => {
  vi.resetAllMocks();
  server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Test server did not expose a usable address");
  }
  baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

describe("words routes", () => {
  it("hasWholeTokenMatch returns true when the search value appears as a full token", () => {
    expect(hasWholeTokenMatch("das haus", "haus")).toBe(true);
  });

  it("hasWholeTokenMatch returns false when the search value is only a substring", () => {
    expect(hasWholeTokenMatch("haushalt", "haus")).toBe(false);
  });

  it("sortWordDetailMatches sorts words, meanings, and translations by ascending id", () => {
    const matches = [
      {
        id: 2,
        value: "zweites wort",
        frequencyRank: 20,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [
          {
            id: 9,
            exampleBase: "second base sentence",
            exampleTarget: "zweiter Beispielsatz",
            partOfSpeech: {
              id: 1,
              value: "noun",
            },
            translations: [
              {
                id: 6,
                toWord: {
                  id: 60,
                  value: "second",
                  frequencyRank: 30,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
              {
                id: 4,
                toWord: {
                  id: 40,
                  value: "another second",
                  frequencyRank: 40,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
          {
            id: 3,
            exampleBase: "first base sentence",
            exampleTarget: "erster Beispielsatz",
            partOfSpeech: {
              id: 2,
              value: "verb",
            },
            translations: [
              {
                id: 5,
                toWord: {
                  id: 50,
                  value: "first",
                  frequencyRank: 50,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
        ],
      },
      {
        id: 1,
        value: "erstes wort",
        frequencyRank: 10,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [],
      },
    ];

    const result = sortWordDetailMatches(matches);

    expect(result.map((word) => word.id)).toEqual([1, 2]);
    expect(result[1]?.meanings.map((meaning) => meaning.id)).toEqual([3, 9]);
    expect(
      result[1]?.meanings[1]?.translations.map((translation) => translation.id),
    ).toEqual([4, 6]);
  });

  it("sortWordDetailMatches does not mutate the original nested arrays", () => {
    const matches = [
      {
        id: 2,
        value: "wort",
        frequencyRank: 20,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [
          {
            id: 9,
            exampleBase: "base",
            exampleTarget: "target",
            partOfSpeech: {
              id: 1,
              value: "noun",
            },
            translations: [
              {
                id: 6,
                toWord: {
                  id: 60,
                  value: "second",
                  frequencyRank: 30,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
              {
                id: 4,
                toWord: {
                  id: 40,
                  value: "first",
                  frequencyRank: 40,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
          {
            id: 3,
            exampleBase: "base 2",
            exampleTarget: "target 2",
            partOfSpeech: {
              id: 2,
              value: "verb",
            },
            translations: [],
          },
        ],
      },
    ];

    const originalMeaningIds = matches[0]?.meanings.map(
      (meaning) => meaning.id,
    );
    const originalTranslationIds = matches[0]?.meanings[0]?.translations.map(
      (translation) => translation.id,
    );

    const result = sortWordDetailMatches(matches);

    expect(originalMeaningIds).toEqual([9, 3]);
    expect(originalTranslationIds).toEqual([6, 4]);
    expect(matches[0]?.meanings.map((meaning) => meaning.id)).toEqual([9, 3]);
    expect(
      matches[0]?.meanings[0]?.translations.map(
        (translation) => translation.id,
      ),
    ).toEqual([6, 4]);
    expect(result[0]?.meanings.map((meaning) => meaning.id)).toEqual([3, 9]);
    expect(
      result[0]?.meanings[1]?.translations.map((translation) => translation.id),
    ).toEqual([4, 6]);
  });

  it("returns words for valid params", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: 1,
      value: "en",
    } as never);
    prismaMock.word.findMany.mockResolvedValueOnce([
      {
        id: 1,
        value: "Haus",
        languageId: 1,
        frequencyRank: 1,
        meanings: [
          {
            exampleBase: "house",
            exampleTarget: "Haus",
            partOfSpeech: { value: "noun" },
            translations: [{ toWord: { value: "house" } }],
          },
        ],
      },
      {
        id: 2,
        value: "Baum",
        languageId: 1,
        frequencyRank: 2,
        meanings: [],
      },
    ] as never);

    const res = await getJson(baseUrl, "/api/words/all?language=en");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        id: 1,
        value: "Haus",
        languageId: 1,
        frequencyRank: 1,
        partOfSpeech: "noun",
        translation: "house",
        exampleBase: "house",
        exampleTarget: "Haus",
      },
      {
        id: 2,
        value: "Baum",
        languageId: 1,
        frequencyRank: 2,
        partOfSpeech: null,
        translation: null,
        exampleBase: null,
        exampleTarget: null,
      },
    ]);
  });

  it("returns 500 on internal error", async () => {
    prismaMock.language.findUnique.mockRejectedValueOnce(new Error("fail"));
    const res = await getJson(baseUrl, "/api/words/all?language=en");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  it("returns 400 for single-word lookup when language is missing", async () => {
    const res = await getJson(baseUrl, "/api/words?word=Haus");

    expect(res.status).toBe(400);

    const body = await res.json();

    expect(body).toHaveProperty("formErrors");
    expect(body).toHaveProperty("fieldErrors");
    expect(body.fieldErrors).toHaveProperty("language");
  });

  it("returns 400 for single-word lookup when the lookup language is unsupported", async () => {
    const res = await getJson(baseUrl, "/api/words?word=Haus&language=fr");

    expect(res.status).toBe(400);

    const body = await res.json();

    expect(body).toHaveProperty("formErrors");
    expect(body).toHaveProperty("fieldErrors");
    expect(body.fieldErrors).toHaveProperty("language");
  });

  it("returns 400 for single-word lookup if the configured lookup language is missing", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce(null);

    const res = await getJson(baseUrl, "/api/words?word=Haus&language=de");

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Language 'de' not found in database",
    });
  });

  it("returns 404 when no German matches are found", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: 1,
      value: "de",
    } as never);
    prismaMock.word.findMany
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never);

    const res = await getJson(baseUrl, "/api/words?word=Haus&language=de");

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({
      error: "Word matching 'Haus' not found for language 'de'",
    });
  });

  it("returns German matches as an array for direct German lookup", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: 1,
      value: "de",
    } as never);
    prismaMock.word.findMany.mockResolvedValueOnce([
      {
        id: 1,
        value: "Haus",
        frequencyRank: 1,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [
          {
            id: 10,
            exampleBase: "The house is big.",
            exampleTarget: "Das Haus ist gross.",
            partOfSpeech: {
              id: 100,
              value: "noun",
            },
            translations: [
              {
                id: 1000,
                toWord: {
                  id: 2,
                  value: "house",
                  frequencyRank: 5,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
        ],
      },
    ] as never);

    const res = await getJson(
      baseUrl,
      "/api/words?word=Haus&language=de",
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        id: 1,
        value: "Haus",
        frequencyRank: 1,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [
          {
            id: 10,
            exampleBase: "The house is big.",
            exampleTarget: "Das Haus ist gross.",
            partOfSpeech: {
              id: 100,
              value: "noun",
            },
            translations: [
              {
                id: 1000,
                toWord: {
                  id: 2,
                  value: "house",
                  frequencyRank: 5,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
        ],
      },
    ]);
    expect(prismaMock.word.findMany).toHaveBeenCalledWith({
      where: {
        languageId: 1,
        value: {
          equals: "Haus",
          mode: "insensitive",
        },
      },
      orderBy: { id: "asc" },
      select: expect.any(Object),
    });
  });

  it("supports partial German lookup for entries that contain multiple forms", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: 1,
      value: "de",
    } as never);
    prismaMock.word.findMany
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([
        {
          id: 7,
          value: "werden, wird, wurde, ist geworden",
          frequencyRank: 4,
          language: {
            id: 1,
            value: "de",
          },
          meanings: [],
        },
      ] as never);

    const res = await getJson(baseUrl, "/api/words?word=werden&language=de");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        id: 7,
        value: "werden, wird, wurde, ist geworden",
        frequencyRank: 4,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [],
      },
    ]);
    expect(prismaMock.word.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        languageId: 1,
        value: {
          equals: "werden",
          mode: "insensitive",
        },
      },
      orderBy: { id: "asc" },
      select: expect.any(Object),
    });
    expect(prismaMock.word.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        languageId: 1,
        value: {
          startsWith: "werden",
          mode: "insensitive",
        },
      },
      orderBy: { id: "asc" },
      select: expect.any(Object),
    });
  });

  it("treats partial German lookup as a whole-token match instead of a substring match", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: 1,
      value: "de",
    } as never);
    prismaMock.word.findMany
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([
        {
          id: 8,
          value: "Haushalt",
          frequencyRank: 12,
          language: {
            id: 1,
            value: "de",
          },
          meanings: [],
        },
      ] as never)
      .mockResolvedValueOnce([
        {
          id: 8,
          value: "Haushalt",
          frequencyRank: 12,
          language: {
            id: 1,
            value: "de",
          },
          meanings: [],
        },
        {
          id: 9,
          value: "das haus",
          frequencyRank: 5,
          language: {
            id: 1,
            value: "de",
          },
          meanings: [],
        },
      ] as never);

    const res = await getJson(baseUrl, "/api/words?word=haus&language=de");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        id: 9,
        value: "das haus",
        frequencyRank: 5,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [],
      },
    ]);
  });

  it("returns linked German meanings for English lookup", async () => {
    prismaMock.language.findUnique
      .mockResolvedValueOnce({
        id: 2,
        value: "en",
      } as never)
      .mockResolvedValueOnce({
        id: 1,
        value: "de",
      } as never);
    prismaMock.word.findMany.mockResolvedValueOnce([
      {
        id: 20,
        value: "to run",
        frequencyRank: null,
        language: {
          id: 2,
          value: "en",
        },
        translationsTo: [
          {
            id: 200,
            exampleSentence: {
              id: 10,
              exampleBase: "I run every day.",
              exampleTarget: "Ich laufe jeden Tag.",
              partOfSpeech: {
                id: 100,
                value: "verb",
              },
              word: {
                id: 1,
                value: "laufen, läuft, lief, ist gelaufen",
                frequencyRank: 7,
                language: {
                  id: 1,
                  value: "de",
                },
              },
            },
          },
          {
            id: 201,
            exampleSentence: {
              id: 11,
              exampleBase: "The program runs smoothly.",
              exampleTarget: "Das Programm läuft reibungslos.",
              partOfSpeech: {
                id: 100,
                value: "verb",
              },
              word: {
                id: 1,
                value: "laufen, läuft, lief, ist gelaufen",
                frequencyRank: 7,
                language: {
                  id: 1,
                  value: "de",
                },
              },
            },
          },
          {
            id: 202,
            exampleSentence: {
              id: 12,
              exampleBase: "She runs fast.",
              exampleTarget: "Sie rennt schnell.",
              partOfSpeech: {
                id: 100,
                value: "verb",
              },
              word: {
                id: 3,
                value: "rennen, rennt, rannte, ist gerannt",
                frequencyRank: 15,
                language: {
                  id: 1,
                  value: "de",
                },
              },
            },
          },
        ],
      },
    ] as never);

    const res = await getJson(
      baseUrl,
      "/api/words?word=to+run&language=en",
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        id: 1,
        value: "laufen, läuft, lief, ist gelaufen",
        frequencyRank: 7,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [
          {
            id: 10,
            exampleBase: "I run every day.",
            exampleTarget: "Ich laufe jeden Tag.",
            partOfSpeech: {
              id: 100,
              value: "verb",
            },
            translations: [
              {
                id: 200,
                toWord: {
                  id: 20,
                  value: "to run",
                  frequencyRank: null,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
          {
            id: 11,
            exampleBase: "The program runs smoothly.",
            exampleTarget: "Das Programm läuft reibungslos.",
            partOfSpeech: {
              id: 100,
              value: "verb",
            },
            translations: [
              {
                id: 201,
                toWord: {
                  id: 20,
                  value: "to run",
                  frequencyRank: null,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
        ],
      },
      {
        id: 3,
        value: "rennen, rennt, rannte, ist gerannt",
        frequencyRank: 15,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [
          {
            id: 12,
            exampleBase: "She runs fast.",
            exampleTarget: "Sie rennt schnell.",
            partOfSpeech: {
              id: 100,
              value: "verb",
            },
            translations: [
              {
                id: 202,
                toWord: {
                  id: 20,
                  value: "to run",
                  frequencyRank: null,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
        ],
      },
    ]);
  });

  it("supports partial English lookup using the same search order", async () => {
    prismaMock.language.findUnique
      .mockResolvedValueOnce({
        id: 2,
        value: "en",
      } as never)
      .mockResolvedValueOnce({
        id: 1,
        value: "de",
      } as never);
    prismaMock.word.findMany
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([
        {
          id: 20,
          value: "to run",
          frequencyRank: null,
          language: {
            id: 2,
            value: "en",
          },
          translationsTo: [
            {
              id: 200,
              exampleSentence: {
                id: 10,
                exampleBase: "I run every day.",
                exampleTarget: "Ich laufe jeden Tag.",
                partOfSpeech: {
                  id: 100,
                  value: "verb",
                },
                word: {
                  id: 1,
                  value: "laufen, läuft, lief, ist gelaufen",
                  frequencyRank: 7,
                  language: {
                    id: 1,
                    value: "de",
                  },
                },
              },
            },
          ],
        },
      ] as never);

    const res = await getJson(baseUrl, "/api/words?word=run&language=en");

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual([
      {
        id: 1,
        value: "laufen, läuft, lief, ist gelaufen",
        frequencyRank: 7,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [
          {
            id: 10,
            exampleBase: "I run every day.",
            exampleTarget: "Ich laufe jeden Tag.",
            partOfSpeech: {
              id: 100,
              value: "verb",
            },
            translations: [
              {
                id: 200,
                toWord: {
                  id: 20,
                  value: "to run",
                  frequencyRank: null,
                  language: {
                    id: 2,
                    value: "en",
                  },
                },
              },
            ],
          },
        ],
      },
    ]);
    expect(prismaMock.word.findMany).toHaveBeenNthCalledWith(1, {
      where: {
        languageId: 2,
        value: {
          equals: "run",
          mode: "insensitive",
        },
        translationsTo: {
          some: {
            exampleSentence: {
              word: {
                languageId: 1,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
      select: expect.any(Object),
    });
    expect(prismaMock.word.findMany).toHaveBeenNthCalledWith(2, {
      where: {
        languageId: 2,
        value: {
          startsWith: "run",
          mode: "insensitive",
        },
        translationsTo: {
          some: {
            exampleSentence: {
              word: {
                languageId: 1,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
      select: expect.any(Object),
    });
    expect(prismaMock.word.findMany).toHaveBeenNthCalledWith(3, {
      where: {
        languageId: 2,
        value: {
          contains: "run",
          mode: "insensitive",
        },
        translationsTo: {
          some: {
            exampleSentence: {
              word: {
                languageId: 1,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
      select: expect.any(Object),
    });
  });
});
