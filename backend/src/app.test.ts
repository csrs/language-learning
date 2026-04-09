import type { Server } from "node:http";
import type { AddressInfo } from "node:net";

import { Prisma } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../prisma/prisma.js";
import { createApp } from "./app.js";
import { SESSION_COOKIE_NAME } from "./lib/session.js";
import { createPasswordHash } from "./lib/password.js";
import {
  getJson,
  getRequiredSessionCookie,
  postJson,
} from "./utils/testUtils.js";

vi.mock("../prisma/prisma.js", () => ({
  prisma: {
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

const prismaMock = vi.mocked(prisma, { deep: true });

let server: Server;
let baseUrl: string;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  vi.resetAllMocks();
  prismaMock.session.create.mockResolvedValue({} as never);
  prismaMock.session.findUnique.mockResolvedValue(null as never);
  prismaMock.session.deleteMany.mockResolvedValue({ count: 0 } as never);
  prismaMock.user.update.mockResolvedValue({} as never);
  prismaMock.user.deleteMany.mockResolvedValue({ count: 0 } as never);
  consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  server = createApp().listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Test server did not expose a usable address");
  }

  baseUrl = `http://127.0.0.1:${(address as AddressInfo).port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  consoleErrorSpy.mockRestore();
});

describe("POST /api/auth/register", () => {
  it("creates a user with a normalized email and hashed password", async () => {
    prismaMock.user.create.mockResolvedValueOnce({
      id: 1,
      username: "Ada",
      email: "ada@example.com",
    } as never);

    const response = await postJson(baseUrl, "/api/auth/register", {
      username: " Ada ",
      email: " ADA@example.com ",
      password: "super-secret",
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      id: 1,
      username: "Ada",
      email: "ada@example.com",
    });

    expect(prismaMock.user.create).toHaveBeenCalledTimes(1);

    const createArgs = prismaMock.user.create.mock.calls[0]?.[0];

    expect(createArgs).toMatchObject({
      data: {
        username: "Ada",
        email: "ada@example.com",
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    expect(createArgs?.data.passwordHash).toMatch(
      /^scrypt:[0-9a-f]+:[0-9a-f]+$/i,
    );
    expect(createArgs?.data.passwordHash).not.toBe("super-secret");
  });

  it("returns 400 when a required field is missing", async () => {
    const response = await postJson(baseUrl, "/api/auth/register", {
      username: "Ada",
      email: "ada@example.com",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      fieldErrors: {
        password: ["Invalid input: expected string, received undefined"],
      },
      formErrors: [],
    });
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("returns 409 when the username already exists", async () => {
    prismaMock.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["username"] },
      }),
    );

    const response = await postJson(baseUrl, "/api/auth/register", {
      username: "Ada",
      email: "ada@example.com",
      password: "super-secret",
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "A user with that username already exists",
    });
  });

  it("returns 409 when the email already exists", async () => {
    prismaMock.user.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
        meta: { target: ["email"] },
      }),
    );

    const response = await postJson(baseUrl, "/api/auth/register", {
      username: "Ada",
      email: "ada@example.com",
      password: "super-secret",
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "A user with that email already exists",
    });
  });

  it("returns 500 when user creation throws an unexpected error", async () => {
    prismaMock.user.create.mockRejectedValueOnce(new Error("database offline"));

    const response = await postJson(baseUrl, "/api/auth/register", {
      username: "Ada",
      email: "ada@example.com",
      password: "super-secret",
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Internal server error",
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  it("logs a user in when the password matches a stored hash", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 7,
      username: "Ada",
      email: "ada@example.com",
      passwordHash: await createPasswordHash("correct-password"),
    });

    const response = await postJson(baseUrl, "/api/auth/login", {
      username: "Ada",
      password: "correct-password",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 7,
      username: "Ada",
      email: "ada@example.com",
    });
    expect(response.headers.get("set-cookie")).toContain(
      `${SESSION_COOKIE_NAME}=`,
    );
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=Lax");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { username: "Ada" },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
      },
    });
  });

  it("returns 400 when username or password is missing", async () => {
    const response = await postJson(baseUrl, "/api/auth/login", {
      username: "Ada",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Username and/or password are incorrect.",
    });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns 401 when the user does not exist", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const response = await postJson(baseUrl, "/api/auth/login", {
      username: "Ada",
      password: "correct-password",
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Username and/or password are incorrect.",
    });
  });

  it("returns 401 when the password is wrong", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 7,
      username: "Ada",
      email: "ada@example.com",
      passwordHash: await createPasswordHash("correct-password"),
    });

    const response = await postJson(baseUrl, "/api/auth/login", {
      username: "Ada",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Username and/or password are incorrect.",
    });
  });

  it("returns 200 and has new sessionId when a logged-in user logs in again", async () => {
    const user = {
      id: 7,
      username: "Ada",
      email: "ada@example.com",
      passwordHash: await createPasswordHash("correct-password"),
    };

    prismaMock.user.findUnique
      .mockResolvedValueOnce(user as never)
      .mockResolvedValueOnce(user as never);

    const response1 = await postJson(baseUrl, "/api/auth/login", {
      username: "Ada",
      password: "correct-password",
    });

    const firstSessionCookie = getRequiredSessionCookie(response1);

    const response2 = await postJson(
      baseUrl,
      "/api/auth/login",
      {
        username: "Ada",
        password: "correct-password",
      },
      {
        headers: {
          Cookie: firstSessionCookie,
        },
      },
    );

    const secondSessionCookie = getRequiredSessionCookie(response2);

    expect(response2.status).toBe(200);
    expect(secondSessionCookie).not.toBe(firstSessionCookie);
  });
});

describe("me routes", () => {
  it("returns the logged-in user for a valid session cookie", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce({
        id: 7,
        username: "Ada",
        email: "ada@example.com",
        passwordHash: await createPasswordHash("correct-password"),
      })
      .mockResolvedValueOnce({
        id: 7,
        username: "Ada",
        email: "ada@example.com",
      } as never);
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 7,
      expiresAt: new Date(Date.now() + 60_000),
    } as never);

    const loginResponse = await postJson(baseUrl, "/api/auth/login", {
      username: "Ada",
      password: "correct-password",
    });
    const sessionCookie = getRequiredSessionCookie(loginResponse);

    const meResponse = await fetch(`${baseUrl}/api/me`, {
      headers: {
        Cookie: sessionCookie,
      },
    });

    expect(meResponse.status).toBe(200);
    await expect(meResponse.json()).resolves.toEqual({
      id: 7,
      username: "Ada",
      email: "ada@example.com",
    });
    expect(prismaMock.user.findUnique).toHaveBeenLastCalledWith({
      where: { id: 7 },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  });

  it("returns 401 for GET /api/me without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/api/me`);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Not authenticated",
    });
  });

  it("returns 401 for PATCH /api/me without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/api/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Ada",
      }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Not authenticated",
    });
  });

  it("updates the username when email is omitted", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 7,
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    prismaMock.user.update.mockResolvedValueOnce({
      id: 7,
      username: "NewAda",
      email: "ada@example.com",
    } as never);

    const response = await fetch(`${baseUrl}/api/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=session-token`,
      },
      body: JSON.stringify({
        username: "NewAda",
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: 7,
      username: "NewAda",
      email: "ada@example.com",
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        username: "NewAda",
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  });

  it("updates the email when username is omitted", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 7,
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    prismaMock.user.update.mockResolvedValueOnce({
      id: 7,
      username: "Ada",
      email: "previous@example.com",
    } as never);

    const response = await fetch(`${baseUrl}/api/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${SESSION_COOKIE_NAME}=session-token`,
      },
      body: JSON.stringify({
        email: "new@example.com",
      }),
    });

    expect(response.status).toBe(200);
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: {
        email: "new@example.com",
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
  });

  it("returns 400 for PATCH /api/me when no fields are provided", async () => {
    const response = await fetch(`${baseUrl}/api/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      fieldErrors: {},
      formErrors: ["At least one of username or email must be provided"],
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns 401 for DELETE /api/me without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/api/me`, {
      method: "DELETE",
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Not authenticated",
    });
  });

  it("returns 400 for PATCH /api/me/password when password is missing", async () => {
    const response = await fetch(`${baseUrl}/api/me/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      fieldErrors: {
        password: ["Invalid input: expected string, received undefined"],
      },
      formErrors: [],
    });
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("returns 401 for PATCH /api/me/password without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/api/me/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: "correct-password",
      }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Not authenticated",
    });
  });

  it("returns 204 for DELETE /api/me with a valid session cookie", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      userId: 7,
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    prismaMock.user.deleteMany.mockResolvedValueOnce({ count: 1 } as never);

    const response = await fetch(`${baseUrl}/api/me`, {
      method: "DELETE",
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=session-token`,
      },
    });

    expect(response.status).toBe(204);
    expect(prismaMock.user.deleteMany).toHaveBeenCalledWith({
      where: { id: 7 },
    });
  });

  it("clears the session cookie on logout", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: 7,
      username: "Ada",
      email: "ada@example.com",
      passwordHash: await createPasswordHash("correct-password"),
    });

    const loginResponse = await postJson(baseUrl, "/api/auth/login", {
      username: "Ada",
      password: "correct-password",
    });
    const sessionCookie = getRequiredSessionCookie(loginResponse);

    const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
      },
    });

    expect(logoutResponse.status).toBe(204);
    expect(logoutResponse.headers.get("set-cookie")).toContain(
      `${SESSION_COOKIE_NAME}=;`,
    );
  });
});

describe("API docs", () => {
  it("serves the Swagger UI page", async () => {
    const response = await fetch(`${baseUrl}/api/docs`);

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");

    const html = await response.text();

    expect(html).toContain("SwaggerUIBundle");
    expect(html).toContain("/api/docs/openapi.json");
  });

  it("serves the OpenAPI document with a placeholder Render URL fallback", async () => {
    const previousRenderExternalUrl = process.env.RENDER_EXTERNAL_URL;
    delete process.env.RENDER_EXTERNAL_URL;

    try {
      const response = await getJson(baseUrl, "/api/docs/openapi.json");

      expect(response.status).toBe(200);

      const json = await response.json();

      expect(json.openapi).toBe("3.0.3");
      expect(json.paths["/api/words"]).toBeDefined();
      expect(json.paths["/api/words/{value}"]).toBeDefined();
      expect(json.paths["/api/auth/login"]).toBeDefined();
    } finally {
      if (previousRenderExternalUrl === undefined) {
        delete process.env.RENDER_EXTERNAL_URL;
      } else {
        process.env.RENDER_EXTERNAL_URL = previousRenderExternalUrl;
      }
    }
  });
});

describe("app middleware", () => {
  it("returns 404 for unknown routes", async () => {
    const response = await fetch(`${baseUrl}/not-a-real-route`);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Cannot GET /not-a-real-route",
    });
  });
});
