import { login } from "../login";

const mockResponseBody = { id: 1, username: "alice" };

describe("login", () => {
  it("sends a POST request with username and password", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), { status: 200 }),
      );

    const result = await login("alice", "secret123");

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "alice",
        password: "secret123",
      }),
    });
    expect(result).toEqual(mockResponseBody);
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(login("alice", "wrong")).rejects.toThrow(
      "Failed to login user",
    );
  });
});
