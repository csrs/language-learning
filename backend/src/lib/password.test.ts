import { describe, expect, it } from "vitest";

import { createPasswordHash, getIsPasswordValid } from "./password.js";

describe("createPasswordHash", () => {
  it("returns a scrypt hash string", async () => {
    const hash = await createPasswordHash("test123");

    expect(hash).toMatch(/^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/i);
  });

  it("creates different hashes for the same password", async () => {
    const firstHash = await createPasswordHash("test123");
    const secondHash = await createPasswordHash("test123");

    expect(firstHash).not.toBe(secondHash);
  });
});

describe("getIsPasswordValid", () => {
  it("returns match for the correct password", async () => {
    const hash = await createPasswordHash("test123");

    await expect(getIsPasswordValid("test123", hash)).resolves.toBe(true);
  });

  it("returns invalid for the wrong password", async () => {
    const hash = await createPasswordHash("test123");

    await expect(getIsPasswordValid("test456", hash)).resolves.toBe(false);
  });

  it("returns invalid for a value that is not in the expected format", async () => {
    await expect(
      getIsPasswordValid("test123", "plain-text-password"),
    ).resolves.toBe(false);
  });

  it("returns invalid for malformed scrypt hashes", async () => {
    await expect(
      getIsPasswordValid("test123", "scrypt:not-hex:still-not-hex"),
    ).resolves.toBe(false);
  });
});
