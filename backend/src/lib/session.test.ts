import { beforeEach, describe, expect, it, vi } from "vitest";

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
  clearExpiredSessions,
  createSession,
  deleteSession,
  getSessionCookieOptions,
  getSessionIdFromCookieHeader,
  getUserIdFromSession,
  SESSION_COOKIE_NAME,
} from "./session.js";

const prismaMock = vi.mocked(prisma, { deep: true });
const SESSION_TTL_MS = 1000 * 60 * 60 * 24;

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.session.create.mockResolvedValue({} as never);
  prismaMock.session.findUnique.mockResolvedValue(null as never);
  prismaMock.session.deleteMany.mockResolvedValue({ count: 0 } as never);
});

describe("createSession", () => {
  it("creates a session record", async () => {
    const sessionId = await createSession(42, 1_000);

    expect(sessionId).toMatch(/^[0-9a-f]+$/i);
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
        id: sessionId,
        userId: 42,
        expiresAt: new Date(1_000 + SESSION_TTL_MS),
      },
    });
  });
});

describe("getUserIdFromSession", () => {
  it("returns the stored user id for an active session", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 42,
      expiresAt: new Date(1_000 + SESSION_TTL_MS),
    } as never);

    await expect(getUserIdFromSession("abc123", 1_001)).resolves.toBe(42);
  });

  it("returns null for an expired session and deletes it", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 42,
      expiresAt: new Date(1_000 + SESSION_TTL_MS),
    } as never);

    await expect(
      getUserIdFromSession("abc123", 1_000 + SESSION_TTL_MS),
    ).resolves.toBeNull();

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { id: "abc123" },
    });
  });
});

describe("deleteSession", () => {
  it("deletes a session", async () => {
    await deleteSession("abc123");

    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { id: "abc123" },
    });
  });
});

describe("clearExpiredSessions", () => {
  it("deletes expired sessions", async () => {
    await clearExpiredSessions(1_000);

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
