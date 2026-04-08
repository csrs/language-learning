import { getWords } from "../getWords";

describe("getWords", () => {
  it("calls fetch with correct URL and params", async () => {
    const mockWords = [{ id: 1, value: "Haus" }];
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockWords), { status: 200 }),
      );

    const result = await getWords("5");

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/words?numOfWords=5&language=de",
    );
    expect(result).toEqual(mockWords);
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    await expect(getWords("5")).rejects.toThrow("Failed to fetch words");
  });
});
