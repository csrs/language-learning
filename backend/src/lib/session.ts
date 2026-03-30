import { randomBytes } from "node:crypto";

import type { CookieOptions } from "express";
import { prisma } from "../../prisma/prisma.js";

export const SESSION_COOKIE_NAME = "sessionId";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const getSessionExpiryDate = (now: number) => new Date(now + SESSION_TTL_MS);

export const createSession = async (
  userId: number,
  now = Date.now(),
): Promise<string> => {
  await clearExpiredSessions(now);

  const sessionId = randomBytes(32).toString("hex");
  // todo: hash the sessionId, so that in the DB it's different than what's in the user's cookie
  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt: getSessionExpiryDate(now),
    },
  });

  return sessionId;
};

export const getUserIdFromSession = async (
  sessionId: string | null,
  now = Date.now(),
): Promise<number | null> => {
  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      userId: true,
      expiresAt: true,
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= now) {
    await deleteSession(sessionId);
    return null;
  }

  return session.userId;
};

export const deleteSession = async (
  sessionId: string | null,
): Promise<void> => {
  if (!sessionId) {
    return;
  }

  await prisma.session.deleteMany({
    where: { id: sessionId },
  });
};

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
