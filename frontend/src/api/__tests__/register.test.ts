import { registerUser } from "../generated/endpoints/auth/auth";

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

    const result = await registerUser({
      username: "alice",
      email: "alice@example.com",
      password: "secret123",
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "alice",
        email: "alice@example.com",
        password: "secret123",
      }),
    });
    expect(result).toEqual({
      data: mockResponseBody,
      status: 201,
      headers: expect.any(Headers),
    });
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    await expect(
      registerUser({
        username: "alice",
        email: "alice@example.com",
        password: "short",
      }),
    ).rejects.toThrow("Request failed with status 400");
  });
});
