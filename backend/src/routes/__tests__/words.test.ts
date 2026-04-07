import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../../app.js";
import { prisma } from "../../../prisma/prisma.js";
import type { Word } from "@prisma/client";
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
  it("returns 400 with validation errors if query params are missing", async () => {
    const res = await getJson(baseUrl, "/api/words");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("formErrors");
    expect(body).toHaveProperty("fieldErrors");
    expect(body.fieldErrors).toHaveProperty("numOfWords");
    expect(body.fieldErrors).toHaveProperty("language");
  });

  it("returns 400 if language is not found", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce(null);
    const res = await getJson(baseUrl, "/api/words?numOfWords=2&language=zz");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Language 'zz' not found in database");
  });

  it("returns words for valid params", async () => {
    prismaMock.language.findUnique.mockResolvedValueOnce({
      id: 1,
      value: "en",
    });
    const mockWords: Word[] = [
      { id: 1, value: "Haus", languageId: 1, frequencyRank: 1 },
      { id: 2, value: "Baum", languageId: 1, frequencyRank: 2 },
    ];
    prismaMock.word.findMany.mockResolvedValueOnce(mockWords);
    const res = await getJson(baseUrl, "/api/words?numOfWords=2&language=en");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockWords);
  });

  it("returns 500 on internal error", async () => {
    prismaMock.language.findUnique.mockRejectedValueOnce(new Error("fail"));
    const res = await getJson(baseUrl, "/api/words?numOfWords=2&language=en");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });
});
