import type { User } from "../types/auth.types";

export const changePassword = async (
  password: string,
): Promise<User | null> => {
  const response = await fetch("/api/me/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: password,
    }),
  });

  if (!response.ok) {
    const body: { error?: string } | null = await response
      .json()
      .catch((): null => null);
    throw new Error(body?.error ?? "Failed to edit password");
  }

  return response.json();
};
