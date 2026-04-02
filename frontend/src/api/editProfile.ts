import type { User } from "../types/auth.types";

export const editProfile = async (
  username: string,
  email: string,
): Promise<User | null> => {
  const response = await fetch("/api/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      email: email,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to edit profile");
  }

  return response.json();
};
