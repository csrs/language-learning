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
      .min(2, { error: "Must be at least 2 characters" })
      .max(20, { error: "Must be at most 20 characters" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "Must be a valid email" })),
    password: z.string().min(8, { error: "Must be at least 8 characters" }),
  })
  .strict();

const loginSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, { error: "Must be at least 2 characters" })
      .max(20, { error: "Must be at most 20 characters" }),
    password: z.string().min(8, { error: "Must be at least 8 characters" }),
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
        passwordHash: await createPasswordHash(password),
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
        error: `Username or email already exists`,
      });
    }

    throw error;
  }
});

router.post("/login", async (req, res) => {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      error: "Username and/or password are incorrect.",
    });
  }

  const { username, password } = parsedBody.data;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return res.status(401).json({
      error: "Username and/or password are incorrect.",
    });
  }

  const passwordStatus = await getIsPasswordValid(password, user.passwordHash);

  if (!passwordStatus) {
    return res.status(401).json({
      error: "Username and/or password are incorrect.",
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
