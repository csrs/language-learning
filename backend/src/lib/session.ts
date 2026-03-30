import "dotenv/config";
import { randomBytes } from "node:crypto";

import type { CookieOptions } from "express";
import { prisma } from "../../prisma/prisma.js";
import { createHmac } from "node:crypto";

export const SESSION_COOKIE_NAME = "sessionId";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const getSessionExpiryDate = (now: number) => new Date(now + SESSION_TTL_MS);

export const getHashedString = (inputString: string) => {
  const secret = process.env.SESSION_SECRET_KEY;

  if (!secret) {
    throw new Error("SESSION_SECRET_KEY is required");
  }

  return createHmac("sha256", secret).update(inputString).digest("hex");
};

export const createSessionInDatabase = async (
  userId: number,
  now = Date.now(),
): Promise<string> => {
  await clearExpiredSessions(now);

  const rawSessionId = randomBytes(32).toString("hex");
  const storedSessionId = getHashedString(rawSessionId);
  await prisma.session.create({
    data: {
      id: storedSessionId,
      userId,
      expiresAt: getSessionExpiryDate(now),
    },
  });

  return rawSessionId;
};

export const getUserIdFromSession = async (
  rawSessionId: string | null,
  now = Date.now(),
): Promise<number | null> => {
  if (!rawSessionId) {
    return null;
  }

  const storedSessionId = getHashedString(rawSessionId);
  const session = await prisma.session.findUnique({
    where: { id: storedSessionId },
    select: {
      userId: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= now) {
    await deleteStoredSessionFromDatabase(storedSessionId);
    return null;
  }

  return session.userId;
};

export const deleteStoredSessionFromDatabase = async (
  storedSessionId: string | null,
): Promise<void> => {
  if (!storedSessionId) {
    return;
  }

  await prisma.session.deleteMany({
    where: { id: storedSessionId },
  });
};

export const deleteRawSessionFromDatabase = async (
  rawSessionId: string | null,
): Promise<void> => {
  if (!rawSessionId) {
    return;
  }
  const storedSessionId = getHashedString(rawSessionId);

  await deleteStoredSessionFromDatabase(storedSessionId);
};

// this is the raw (non-hashed) sessionId
export const getSessionIdFromCookieHeader = (
  cookieHeader: string | undefined,
): string | null => {
  if (!cookieHeader) {
    return null;
  }

  for (const cookiePart of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookiePart.trim().split("=");

    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
};

export const getSessionCookieOptions = (): CookieOptions => {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
};

export const clearExpiredSessions = async (now = Date.now()): Promise<void> => {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(now),
      },
    },
  });
};
