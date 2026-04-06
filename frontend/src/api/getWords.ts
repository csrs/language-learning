export interface Word {
  id: number;
  value: string;
  languageId: number;
  frequencyRank: number | null;
}

export const getWords = async (numOfWords: string): Promise<Word[]> => {
  const params = new URLSearchParams({
    numOfWords: numOfWords,
    language: "de",
  });
  const response = await fetch(`/api/words?${params.toString()}`);
  if (!response.ok) {
    const body: { error?: string } | null = await response
      .json()
      .catch((): null => null);
    throw new Error(body?.error ?? "Failed to fetch words");
  }
  return response.json();
};
