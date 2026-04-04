import { createHmac } from "node:crypto";

export const getHmacHashedString = (inputString: string) => {
  const secret = process.env.SESSION_SECRET_KEY;

  if (!secret) {
    throw new Error("SESSION_SECRET_KEY is required");
  }

  return createHmac("sha256", secret).update(inputString).digest("hex");
};

export const normalizeVerbsToInfinitive = (input: string): string => {
  return input
    .split(",")
    .map((verb) => {
      const trimmed = verb.trim();
      return trimmed.startsWith("to ") ? trimmed : "to " + trimmed;
    })
    .join(", ");
};
