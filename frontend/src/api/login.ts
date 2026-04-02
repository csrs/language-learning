import type { User } from "../types/auth.types";

export const login = async (
  email: string,
  password: string,
): Promise<User | null> => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email, password: password }),
  });

  if (!response.ok) {
    throw new Error("Failed to login user");
  }

  return response.json();
};
