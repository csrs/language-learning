import { updateCurrentUser } from "../generated/endpoints/me/me";

const mockResponseBody = { id: 1, username: "bob", email: "bob@example.com" };

describe("editProfile", () => {
  it("sends a PATCH request with username and email", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), { status: 200 }),
      );

    const result = await updateCurrentUser({
      username: "bob",
      email: "bob@example.com",
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "bob",
        email: "bob@example.com",
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
      new Response(null, { status: 400 }),
    );

    await expect(
      updateCurrentUser({ username: "bob", email: "bad-email" }),
    ).rejects.toThrow("Request failed with status 400");
  });
});
