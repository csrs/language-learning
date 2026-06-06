import { loginUser } from "../generated/endpoints/auth/auth";

const mockResponseBody = { id: 1, username: "alice", email: "a@test.com" };

describe("login", () => {
  it("sends a POST request with username and password", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), { status: 200 }),
      );

    const result = await loginUser({
      username: "alice",
      password: "secret123",
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "alice",
        password: "secret123",
      }),
    });
    expect(result).toEqual({
      data: mockResponseBody,
      status: 200,
      headers: expect.any(Headers),
    });
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(
      loginUser({ username: "alice", password: "wrong" }),
    ).rejects.toThrow("Request failed with status 401");
  });
});
