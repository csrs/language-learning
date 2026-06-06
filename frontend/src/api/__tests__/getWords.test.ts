import { afterEach } from "vitest";
import {
  getAllWords,
  getWordDetails,
} from "../generated/endpoints/words/words";
import type { WordDetail } from "../generated/types";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAllWords", () => {
  it("calls fetch with correct URL and param", async () => {
    const mockWords = [{ id: 1, value: "Haus" }];
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockWords), { status: 200 }),
      );

    const result = await getAllWords();

    expect(fetchSpy).toHaveBeenCalledWith("/api/words/all", {
      method: "GET",
    });
    expect(result).toEqual({
      data: mockWords,
      status: 200,
      headers: expect.any(Headers),
    });
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    await expect(getAllWords()).rejects.toThrow(
      "Request failed with status 400",
    );
  });
});

describe("getDetailsByValue", () => {
  it("calls fetch with the word in the path", async () => {
    const mockWord: WordDetail[] = [
      {
        id: 1,
        value: "Haus",
        frequencyRank: 1,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [],
      },
    ];
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockWord), { status: 200 }),
      );

    const result = await getWordDetails({ word: "Haus", language: "de" });

    expect(fetchSpy).toHaveBeenCalledWith("/api/words?word=Haus&language=de", {
      method: "GET",
    });
    expect(result).toEqual({
      data: mockWord,
      status: 200,
      headers: expect.any(Headers),
    });
  });

  it("supports English reverse lookup and encodes the path value", async () => {
    const mockWord: WordDetail[] = [
      {
        id: 1,
        value: "laufen, läuft, lief, ist gelaufen",
        frequencyRank: 7,
        language: {
          id: 1,
          value: "de",
        },
        meanings: [],
      },
    ];
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockWord), { status: 200 }),
      );

    const result = await getWordDetails({ word: "to run", language: "en" });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/words?word=to+run&language=en",
      {
        method: "GET",
      },
    );
    expect(result).toEqual({
      data: mockWord,
      status: 200,
      headers: expect.any(Headers),
    });
  });

  it("throws when fetching the word details fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Word 'Haus' not found" }), {
        status: 404,
      }),
    );

    await expect(
      getWordDetails({ word: "Haus", language: "en" }),
    ).rejects.toThrow("Word 'Haus' not found");
  });
});
