import { login } from "./login";

const mockResponseBody = { id: 1, email: "alice@example.com" };

describe("login", () => {
  it("sends a POST request with email and password", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), { status: 200 }),
      );

    const result = await login("alice@example.com", "secret123");

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "alice@example.com",
        password: "secret123",
      }),
    });
    expect(result).toEqual(mockResponseBody);
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(login("alice@example.com", "wrong")).rejects.toThrow(
      "Failed to login user",
    );
  });
});
