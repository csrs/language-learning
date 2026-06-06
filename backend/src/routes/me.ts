import { Router } from "express";

import { prisma } from "../../prisma/prisma.js";
import {
  deleteSession,
  getSessionCookieOptions,
  getSessionIdFromCookieHeader,
  getUserIdFromSession,
  SESSION_COOKIE_NAME,
} from "../lib/session.js";
import z from "zod";
import { createPasswordHash } from "../lib/password.js";
import { Prisma } from "@prisma/client";

const editUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, { error: "Must be at least 2 characters" })
      .max(20, { error: "Must be at most 20 characters" })
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "Must be a valid email" }))
      .optional(),
  })
  .refine((data) => data.username !== undefined || data.email !== undefined, {
    error: "At least one of username or email must be provided",
  });

const editPasswordSchema = z
  .object({
    password: z.string().min(8, { error: "Must be at least 8 characters" }),
  })
  .strict();

export const router = Router();

router.get("/", async (req, res) => {
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

router.patch("/", async (req, res) => {
  const parsedBody = editUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const flattenedError = z.flattenError(parsedBody.error);

    return res.status(400).json({
      formErrors: flattenedError.formErrors,
      fieldErrors: flattenedError.fieldErrors,
    });
  }

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
  const { username, email } = parsedBody.data;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username ? { username } : {}),
        ...(email ? { email } : {}),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return res.json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: `Username or email is already assigned to a different user`,
      });
    }

    throw error;
  }
});

router.patch("/password", async (req, res) => {
  const parsedBody = editPasswordSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const flattenedError = z.flattenError(parsedBody.error);

    return res.status(400).json({
      formErrors: flattenedError.formErrors,
      fieldErrors: flattenedError.fieldErrors,
    });
  }

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

  const user = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await createPasswordHash(parsedBody.data.password) },
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

router.delete("/", async (req, res) => {
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

  const user = await prisma.user.deleteMany({
    where: { id: userId },
  });

  if (!user) {
    await deleteSession(sessionId);
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  return res.status(204).send();
});
