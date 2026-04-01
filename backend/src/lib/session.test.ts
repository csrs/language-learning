import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../prisma/prisma.js", () => ({
  prisma: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

import { prisma } from "../../prisma/prisma.js";
import {
  deleteExpiredSessions,
  createSession,
  getSessionCookieOptions,
  getSessionIdFromCookieHeader,
  getUserIdFromSession,
  SESSION_COOKIE_NAME,
  deleteSession,
} from "./session.js";
import { getHmacHashedString } from "../utils/stringUtils.js";

const prismaMock = vi.mocked(prisma, { deep: true });
const SESSION_TTL_MS = 1000 * 60 * 60 * 24;
const previousSessionSecret = process.env.SESSION_SECRET_KEY;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SESSION_SECRET_KEY = "test-session-secret";
  prismaMock.session.create.mockResolvedValue({} as never);
  prismaMock.session.findUnique.mockResolvedValue(null as never);
  prismaMock.session.deleteMany.mockResolvedValue({ count: 0 } as never);
});

afterEach(() => {
  if (previousSessionSecret === undefined) {
    delete process.env.SESSION_SECRET_KEY;
    return;
  }

  process.env.SESSION_SECRET_KEY = previousSessionSecret;
});

describe("createSession", () => {
  it("returns the raw session id and stores only the hashed session id", async () => {
    const rawSessionId = await createSession(1, undefined, 1_000);
    const storedSessionId = getHmacHashedString(rawSessionId);

    expect(rawSessionId).toMatch(/^[0-9a-f]{64}$/i);
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: {
        expiresAt: {
          lte: new Date(1_000),
        },
      },
    });
    expect(prismaMock.session.create).toHaveBeenCalledTimes(1);

    expect(prismaMock.session.create).toHaveBeenCalledWith({
      data: {
        id: storedSessionId,
        userId: 1,
        expiresAt: new Date(1_000 + SESSION_TTL_MS),
      },
    });
    expect(storedSessionId).not.toBe(rawSessionId);
  });

  it("deletes an existing session from the cookie header before creating a new one", async () => {
    const existingSessionId = "existing-session-id";
    const cookieHeader = `${SESSION_COOKIE_NAME}=${existingSessionId}`;

    await createSession(1, cookieHeader, 1_000);

    expect(prismaMock.session.deleteMany).toHaveBeenNthCalledWith(1, {
      where: {
        expiresAt: {
          lte: new Date(1_000),
        },
      },
    });
    expect(prismaMock.session.deleteMany).toHaveBeenNthCalledWith(2, {
      where: {
        id: getHmacHashedString(existingSessionId),
      },
    });
    expect(prismaMock.session.create).toHaveBeenCalledTimes(1);
  });
});

describe("getUserIdFromSession", () => {
  it("returns the stored user id for an active session", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 1,
      expiresAt: new Date(1_000 + SESSION_TTL_MS),
    } as never);

    await expect(getUserIdFromSession("abc123", 1_001)).resolves.toBe(1);
  });

  it("returns null for an expired session and deletes it", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 1,
      expiresAt: new Date(1_000 + SESSION_TTL_MS),
    } as never);

    await expect(
      getUserIdFromSession("abc123", 1_000 + SESSION_TTL_MS),
    ).resolves.toBeNull();

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { id: getHmacHashedString("abc123") },
    });
  });
});

describe("deleteSession", () => {
  it("deletes a session", async () => {
    await deleteSession("abc123");

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: {
        id: getHmacHashedString("abc123"),
      },
    });
  });
});

describe("deleteExpiredSessions", () => {
  it("deletes expired sessions", async () => {
    await deleteExpiredSessions(1_000);

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: {
        expiresAt: {
          lte: new Date(1_000),
        },
      },
    });
  });
});

describe("getSessionIdFromCookieHeader", () => {
  it("reads the session id from a cookie header", () => {
    const cookieHeader = `theme=dark; ${SESSION_COOKIE_NAME}=abc123; mode=test`;

    expect(getSessionIdFromCookieHeader(cookieHeader)).toBe("abc123");
  });

  it("returns null when the session cookie is missing", () => {
    expect(getSessionIdFromCookieHeader("theme=dark")).toBe(null);
  });
});

describe("getSessionCookieOptions", () => {
  it("returns secure cookie options only in production", () => {
    const previousNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = "production";
    expect(getSessionCookieOptions()).toMatchObject({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
    });

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
      return;
    }

    process.env.NODE_ENV = previousNodeEnv;
  });
});
