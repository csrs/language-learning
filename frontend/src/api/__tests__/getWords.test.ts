import { afterEach } from "vitest";
import type { WordDetailsResponse } from "../getWords";
import { getAllWords, getDetailsByValue } from "../getWords";

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

    expect(fetchSpy).toHaveBeenCalledWith("/api/words/all?language=de");
    expect(result).toEqual(mockWords);
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    await expect(getAllWords()).rejects.toThrow("Failed to fetch words");
  });
});

describe("getDetailsByValue", () => {
  it("calls fetch with the word in the path", async () => {
    const mockWord: WordDetailsResponse[] = [
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

    const result = await getDetailsByValue("Haus");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/words?word=Haus&word=Haus&language=de",
    );
    expect(result).toEqual(mockWord);
  });

  it("supports English reverse lookup and encodes the path value", async () => {
    const mockWord: WordDetailsResponse[] = [
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

    const result = await getDetailsByValue("to run", "en");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/words?word=to%20run&word=to+run&language=en",
    );
    expect(result).toEqual(mockWord);
  });

  it("throws when fetching the word details fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Word 'Haus' not found" }), {
        status: 404,
      }),
    );

    await expect(getDetailsByValue("Haus")).rejects.toThrow(
      "Word 'Haus' not found",
    );
  });
});
