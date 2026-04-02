import { register } from "./register";

const mockResponseBody = {
  id: 1,
  username: "alice",
  email: "alice@example.com",
};

describe("register", () => {
  it("sends a POST request with username, email, and password", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), { status: 201 }),
      );

    const result = await register("alice", "alice@example.com", "secret123");

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "alice",
        email: "alice@example.com",
        password: "secret123",
      }),
    });
    expect(result).toEqual(mockResponseBody);
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    await expect(
      register("alice", "alice@example.com", "short"),
    ).rejects.toThrow("Failed to register user");
  });
});
