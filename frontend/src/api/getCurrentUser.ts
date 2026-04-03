import type { User } from "../types/auth.types";

export const getCurrentUser = async (): Promise<User | null> => {
  const response = await fetch("/api/me", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to get currently-logged-in user");
  }

  return response.json();
};
