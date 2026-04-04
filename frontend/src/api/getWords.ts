export async function getWords(numOfWords: string) {
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
}
