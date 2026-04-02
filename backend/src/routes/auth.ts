import { Prisma } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../prisma/prisma.js";
import { createPasswordHash, getIsPasswordValid } from "../lib/password.js";
import {
  createSession,
  deleteSession,
  getSessionCookieOptions,
  getSessionIdFromCookieHeader,
  SESSION_COOKIE_NAME,
} from "../lib/session.js";
import z from "zod";

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, { error: "must be at least 2 characters" })
      .max(20, { error: "must be at most 20 characters" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "must be a valid email" })),
    password: z.string().min(8, { error: "must be at least 8 characters" }),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "must be a valid email" })),
    password: z.string().min(8, { error: "must be at least 8 characters" }),
  })
  .strict();

export const router = Router();

router.post("/register", async (req, res) => {
  const parsedBody = registerSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const flattenedError = z.flattenError(parsedBody.error);

    return res.status(400).json({
      formErrors: flattenedError.formErrors,
      fieldErrors: flattenedError.fieldErrors,
    });
  }

  const { username, email, password } = parsedBody.data;

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: await createPasswordHash(password),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "A user with that username or email already exists",
      });
    }

    throw error;
  }
});

router.post("/login", async (req, res) => {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: "email and/or password are missing or incorrect",
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
      error: "Invalid email and/or password",
    });
  }

  const passwordStatus = await getIsPasswordValid(password, user.password_hash);

  if (!passwordStatus) {
    return res.status(401).json({
      error: "Invalid email and/or password",
    });
  }

  const sessionId = await createSession(user.id, req.headers.cookie);
  res.cookie(SESSION_COOKIE_NAME, sessionId, getSessionCookieOptions());

  return res.json({
    id: user.id,
    username: user.username,
    email: user.email,
  });
});

router.post("/logout", async (req, res) => {
  const sessionId = getSessionIdFromCookieHeader(req.headers.cookie);

  await deleteSession(sessionId);
  res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

  return res.status(204).send();
});
