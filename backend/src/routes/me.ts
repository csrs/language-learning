import { Router } from "express";

import { prisma } from "../../prisma/prisma.ts";
import {
  deleteRawSessionFromDatabase,
  getSessionCookieOptions,
  getSessionIdFromCookieHeader,
  getUserIdFromSession,
  SESSION_COOKIE_NAME,
} from "../lib/session.ts";

export const router = Router();

router.get("/", async (req, res) => {
  const rawSessionId = getSessionIdFromCookieHeader(req.headers.cookie);
  const userId = await getUserIdFromSession(rawSessionId);

  if (!userId) {
    await deleteRawSessionFromDatabase(rawSessionId);
    if (rawSessionId) {
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
    await deleteRawSessionFromDatabase(rawSessionId);
    res.clearCookie(SESSION_COOKIE_NAME, getSessionCookieOptions());

    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  return res.json(user);
});

router.patch("/", (_req, res) => {
  return res.status(501).json({
    error: "Not implemented",
  });
});

router.delete("/", (_req, res) => {
  return res.status(501).json({
    error: "Not implemented",
  });
});

router.patch("/edit-password", (_req, res) => {
  return res.status(501).json({
    error: "Not implemented",
  });
});
