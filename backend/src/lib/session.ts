import { randomBytes } from "node:crypto";

import type { CookieOptions } from "express";
import { prisma } from "../../prisma/prisma.js";
import { getHmacHashedString } from "../utils/stringUtils.js";

export const SESSION_COOKIE_NAME = "sessionId";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const getSessionExpiryDate = (now: number) => new Date(now + SESSION_TTL_MS);

export const createSession = async (
  userId: number,
  cookieHeader?: string,
  now = Date.now(),
): Promise<string> => {
  await deleteExpiredSessions(now);
  const existingSessionId = getSessionIdFromCookieHeader(cookieHeader);
  if (existingSessionId) {
    await deleteSession(existingSessionId);
  }

  const rawSessionId = randomBytes(32).toString("hex");
  const storedSessionId = getHmacHashedString(rawSessionId);
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

  const storedSessionId = getHmacHashedString(rawSessionId);
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
    await deleteStoredSession(storedSessionId);
    return null;
  }

  return session.userId;
};

const deleteStoredSession = async (storedSessionId: string): Promise<void> => {
  await prisma.session.deleteMany({
    where: { id: storedSessionId },
  });
};

export const deleteSession = async (
  rawSessionId: string | null,
): Promise<void> => {
  if (!rawSessionId) {
    return;
  }
  const storedSessionId = getHmacHashedString(rawSessionId);

  await deleteStoredSession(storedSessionId);
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

export const deleteExpiredSessions = async (
  now = Date.now(),
): Promise<void> => {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lte: new Date(now),
      },
    },
  });
};
