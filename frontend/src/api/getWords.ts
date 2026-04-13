export interface WordSuccessResponse {
  id: number;
  value: string;
  languageId: number;
  frequencyRank: number | null;
  partOfSpeech: string | null;
  translation: string | null;
  exampleBase: string | null;
  exampleTarget: string | null;
}

export interface WordDetailsLanguageResponse {
  id: number;
  value: string;
}

export interface WordDetailsTargetWordResponse {
  id: number;
  value: string;
  frequencyRank: number | null;
  language: WordDetailsLanguageResponse;
}

export interface WordDetailsTranslationResponse {
  id: number;
  toWord: WordDetailsTargetWordResponse;
}

export interface WordDetailsPartOfSpeechResponse {
  id: number;
  value: string;
}

export interface WordDetailsMeaningResponse {
  id: number;
  exampleBase: string;
  exampleTarget: string;
  partOfSpeech: WordDetailsPartOfSpeechResponse;
  translations: WordDetailsTranslationResponse[];
}

export interface WordDetailsResponse {
  id: number;
  value: string;
  frequencyRank: number | null;
  language: WordDetailsLanguageResponse;
  meanings: WordDetailsMeaningResponse[];
}

export type WordLookupLanguage = "de" | "en";

export const getAllWords = async (): Promise<WordSuccessResponse[]> => {
  const params = new URLSearchParams({
    language: "de",
  });
  const response = await fetch(`/api/words/all?${params.toString()}`);
  if (!response.ok) {
    const body: { error?: string } | null = await response
      .json()
      .catch((): null => null);
    throw new Error(body?.error ?? "Failed to fetch words");
  }
  return response.json();
};

export const getDetailsByValue = async (
  word: string,
  language: WordLookupLanguage = "de",
): Promise<WordDetailsResponse[]> => {
  const params = new URLSearchParams({
    word,
    language,
  });
  const encodedWord = encodeURIComponent(word);
  const response = await fetch(
    `/api/words?word=${encodedWord}&${params.toString()}`,
  );
  if (!response.ok) {
    const body: { error?: string } | null = await response
      .json()
      .catch((): null => null);
    throw new Error(
      body?.error ?? `Failed to fetch info about the word "${word}"`,
    );
  }
  return response.json();
};
