import type { User } from "../types/auth.types";

export const getCurrentUser = async (): Promise<User | null> => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_BASE_URL}/api/me`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get currently-logged-in user");
  }

  return response.json();
};
