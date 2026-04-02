import type { User } from "../types/auth.types";

export const login = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username, password: password }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to login user");
  }

  return response.json();
};
