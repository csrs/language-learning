import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../../../prisma/prisma.js";
import type { Language } from "@prisma/client";
import { addRowsToDatabase } from "../ankiToDatabase.js";

vi.mock("../../../../prisma/prisma.js", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>("../../../../prisma/prisma.js");
  return {
    ...actual,
    prisma: {
      ...actual.prisma,
      word: {
        ...actual.prisma.word,
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      partOfSpeech: {
        ...actual.prisma.partOfSpeech,
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      exampleSentence: {
        ...actual.prisma.exampleSentence,
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      translation: {
        ...actual.prisma.translation,
        createMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    },
  };
});

describe("addRowsToDatabase", () => {
  const baseLang: Language = { id: 1, value: "de" };
  const targetLang: Language = { id: 2, value: "en" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls createMany for base words and target words", async () => {
    const rows = [
      {
        id: "1",
        base_word: "der",
        target_part_of_speech_1: "art",
        target_word_1: "the",
        base_sentence_1: "Der Frau.",
        target_sentence_1: "The woman.",
        target_part_of_speech_2: "pron",
        target_word_2: "that, those",
        base_sentence_2: "Das ist die Frau.",
        target_sentence_2: "That is the woman.",
      },
      {
        id: "2",
        base_word: "gehen",
        target_part_of_speech_1: "verb",
        target_word_1: "to go",
        base_sentence_1: "Ich gehe.",
        target_sentence_1: "I go.",
      },
    ];

    vi.mocked(prisma.word.findMany).mockResolvedValueOnce([
      { id: 1, value: "der", languageId: baseLang.id, frequencyRank: 1 },
      { id: 2, value: "gehen", languageId: baseLang.id, frequencyRank: 2 },
    ]);
    vi.mocked(prisma.word.findMany).mockResolvedValueOnce([]);

    vi.mocked(prisma.partOfSpeech.findMany).mockResolvedValueOnce([
      { id: 1, value: "art" },
      { id: 2, value: "pron" },
      { id: 3, value: "verb" },
    ]);

    await addRowsToDatabase(rows, 1, baseLang, targetLang);

    expect(prisma.word.createMany).toHaveBeenCalled();
    expect(prisma.word.createMany).toHaveBeenCalledTimes(2);
    expect(prisma.word.createMany).toHaveBeenNthCalledWith(1, {
      data: [
        { value: "der", languageId: baseLang.id, frequencyRank: 1 },
        { value: "gehen", languageId: baseLang.id, frequencyRank: 2 },
      ],
      skipDuplicates: true,
    });

    expect(prisma.word.createMany).toHaveBeenNthCalledWith(2, {
      data: [
        { value: "the", languageId: targetLang.id },
        { value: "that, those", languageId: targetLang.id },
        { value: "to go", languageId: targetLang.id },
      ],
      skipDuplicates: true,
    });
  });

  it("calls createMany for parts of speech", async () => {
    const rows = [
      {
        id: "1",
        base_word: "laufen",
        target_part_of_speech_1: "verb",
        target_word_1: "to run",
        base_sentence_1: "Ich laufe.",
        target_sentence_1: "I run.",
      },
    ];

    await addRowsToDatabase(rows, 1, baseLang, targetLang);

    expect(prisma.partOfSpeech.createMany).toHaveBeenCalledWith({
      data: [{ value: "verb" }],
      skipDuplicates: true,
    });
  });

  it("calls createMany once for parts of speech when there are multiple parts of speech in the input", async () => {
    const rows = [
      {
        id: "1",
        base_word: "laufen",
        target_part_of_speech_1: "verb",
        target_word_1: "to run",
        base_sentence_1: "Ich laufe.",
        target_sentence_1: "I run.",
        target_part_of_speech_2: "verb",
        target_word_2: "to run",
        base_sentence_2: "Ich laufe.",
        target_sentence_2: "I run.",
      },
    ];

    await addRowsToDatabase(rows, 1, baseLang, targetLang);

    expect(prisma.partOfSpeech.createMany).toHaveBeenCalledTimes(1);
  });

  it("calls createMany for example sentences", async () => {
    const rows = [
      {
        id: "1",
        base_word: "der",
        target_part_of_speech_1: "art",
        target_word_1: "the",
        base_sentence_1: "Der Frau.",
        target_sentence_1: "The woman.",
        target_part_of_speech_2: "pron",
        target_word_2: "that, those",
        base_sentence_2: "Das ist die Frau.",
        target_sentence_2: "That is the woman.",
      },
      {
        id: "2",
        base_word: "gehen",
        target_part_of_speech_1: "verb",
        target_word_1: "to go",
        base_sentence_1: "Ich gehe.",
        target_sentence_1: "I go.",
      },
    ];

    vi.mocked(prisma.word.findMany).mockResolvedValueOnce([
      { id: 1, value: "der", languageId: baseLang.id, frequencyRank: 1 },
      { id: 2, value: "gehen", languageId: baseLang.id, frequencyRank: 2 },
    ]);

    vi.mocked(prisma.partOfSpeech.findMany).mockResolvedValueOnce([
      { id: 1, value: "art" },
      { id: 2, value: "pron" },
      { id: 3, value: "verb" },
    ]);

    await addRowsToDatabase(rows, 1, baseLang, targetLang);

    expect(prisma.exampleSentence.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.exampleSentence.createMany).toHaveBeenCalledWith({
      data: [
        {
          wordId: 1,
          partOfSpeechId: 1,
          exampleTarget: "Der Frau.",
          exampleBase: "The woman.",
        },
        {
          wordId: 1,
          partOfSpeechId: 2,
          exampleTarget: "Das ist die Frau.",
          exampleBase: "That is the woman.",
        },
        {
          wordId: 2,
          partOfSpeechId: 3,
          exampleTarget: "Ich gehe.",
          exampleBase: "I go.",
        },
      ],
      skipDuplicates: true,
    });
  });

  it("calls createMany for translations", async () => {
    const rows = [
      {
        id: "1",
        base_word: "der",
        target_part_of_speech_1: "art",
        target_word_1: "the",
        base_sentence_1: "Der Frau.",
        target_sentence_1: "The woman.",
        target_part_of_speech_2: "pron",
        target_word_2: "that, those",
        base_sentence_2: "Das ist die Frau.",
        target_sentence_2: "That is the woman.",
      },
      {
        id: "2",
        base_word: "gehen",
        target_part_of_speech_1: "verb",
        target_word_1: "to go",
        base_sentence_1: "Ich gehe.",
        target_sentence_1: "I go.",
      },
    ];

    vi.mocked(prisma.word.findMany).mockResolvedValueOnce([
      { id: 1, value: "der", languageId: baseLang.id, frequencyRank: 1 },
      { id: 2, value: "gehen", languageId: baseLang.id, frequencyRank: 2 },
    ]);

    vi.mocked(prisma.partOfSpeech.findMany).mockResolvedValueOnce([
      { id: 1, value: "art" },
      { id: 2, value: "pron" },
      { id: 3, value: "verb" },
    ]);

    vi.mocked(prisma.exampleSentence.findMany).mockResolvedValueOnce([
      {
        id: 10,
        wordId: 1,
        partOfSpeechId: 1,
        exampleTarget: "Der Frau.",
        exampleBase: "The woman.",
      },
      {
        id: 11,
        wordId: 1,
        partOfSpeechId: 2,
        exampleTarget: "Das ist die Frau.",
        exampleBase: "That is the woman.",
      },
      {
        id: 12,
        wordId: 2,
        partOfSpeechId: 3,
        exampleTarget: "Ich gehe.",
        exampleBase: "I go.",
      },
    ]);

    vi.mocked(prisma.word.findMany).mockResolvedValueOnce([
      { id: 20, value: "the", languageId: targetLang.id, frequencyRank: null },
      {
        id: 21,
        value: "that, those",
        languageId: targetLang.id,
        frequencyRank: null,
      },
      {
        id: 22,
        value: "to go",
        languageId: targetLang.id,
        frequencyRank: null,
      },
    ]);

    await addRowsToDatabase(rows, 1, baseLang, targetLang);

    expect(prisma.translation.createMany).toHaveBeenCalledTimes(1);
    expect(prisma.translation.createMany).toHaveBeenCalledWith({
      data: [
        { exampleSentenceId: 10, toWordId: 20 },
        { exampleSentenceId: 11, toWordId: 21 },
        { exampleSentenceId: 12, toWordId: 22 },
      ],
      skipDuplicates: true,
    });
  });
});
