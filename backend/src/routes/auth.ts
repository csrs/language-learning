import { Router } from "express";

import { prisma } from "../../prisma/prisma.js";
import { getIsPasswordValid } from "../lib/password.js";
import {
  createSession,
  deleteSession,
  getSessionCookieOptions,
  getSessionIdFromCookieHeader,
  getUserIdFromSession,
  SESSION_COOKIE_NAME,
} from "../lib/session.js";
import z from "zod";

const loginSchema = z
  .object({
    email: z.string().trim().min(1),
    password: z.string().min(1),
  })
  .strict();

export const router = Router();

router.post("/login", async (req, res) => {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: "email and password are required",
    });
  }

  const { email, password } = parsedBody.data;

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      username: true,
      email: true,
      password_hash: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      error: "Invalid email or password",
    });
  }

  const passwordStatus = await getIsPasswordValid(password, user.password_hash);

  if (!passwordStatus) {
    return res.status(401).json({
      error: "Invalid email or password",
    });
  }

  const existingSessionId = getSessionIdFromCookieHeader(req.headers.cookie);
  if (existingSessionId) {
    await deleteSession(existingSessionId);
  }

  const newSessionId = await createSession(user.id);
  res.cookie(SESSION_COOKIE_NAME, newSessionId, getSessionCookieOptions());

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
  });
});

router.get("/me", async (req, res) => {
  const sessionId = getSessionIdFromCookieHeader(req.headers.cookie);
  const userId = await getUserIdFromSession(sessionId);

  if (!userId) {
    await deleteSession(sessionId);
    if (sessionId) {
      res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());
    }

    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });

  if (!user) {
    await deleteSession(sessionId);
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  return res.json(user);
});

router.post("/logout", async (req, res) => {
  const sessionId = getSessionIdFromCookieHeader(req.headers.cookie);

  await deleteSession(sessionId);
  res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

  return res.status(204).send();
});
