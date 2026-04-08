import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Language } from "@prisma/client";
import { prisma } from "../../../../prisma/prisma.js";
import { seedLanguageTable } from "../seedLanguages.js";

vi.mock("../../../../prisma/prisma.js", async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual = await vi.importActual<any>("../../../../prisma/prisma.js");
  return {
    ...actual,
    prisma: {
      ...actual.prisma,
      language: {
        ...actual.prisma.language,
        upsert: vi.fn(),
      },
    },
  };
});

describe("seedLanguageTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("upserts both languages and returns them", async () => {
    const baseLang: Language = { id: 1, value: "de" };
    const targetLang: Language = { id: 2, value: "en" };

    vi.mocked(prisma.language.upsert)
      .mockResolvedValueOnce(baseLang)
      .mockResolvedValueOnce(targetLang);

    await expect(seedLanguageTable("de", "en")).resolves.toEqual({
      baseLang,
      targetLang,
    });

    expect(prisma.language.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.language.upsert).toHaveBeenNthCalledWith(1, {
      where: { value: "de" },
      update: {},
      create: { value: "de" },
    });
    expect(prisma.language.upsert).toHaveBeenNthCalledWith(2, {
      where: { value: "en" },
      update: {},
      create: { value: "en" },
    });
    expect(console.log).toHaveBeenCalledWith("Languages seeded: de(1), en(2)");
  });

  it("logs and rethrows if an upsert fails", async () => {
    const baseLang: Language = { id: 1, value: "de" };
    const error = new Error("database failed");

    vi.mocked(prisma.language.upsert)
      .mockResolvedValueOnce(baseLang)
      .mockRejectedValueOnce(error);

    await expect(seedLanguageTable("de", "en")).rejects.toThrow(error);

    expect(prisma.language.upsert).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(
      "Error seeding Language table: ",
      error,
    );
  });
});
