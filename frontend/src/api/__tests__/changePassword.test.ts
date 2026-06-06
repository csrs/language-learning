import { updateCurrentUserPassword } from "../generated/endpoints/me/me";

describe("changePassword", () => {
  it("sends a PATCH request with the new password", async () => {
    const mockResponseBody = { id: 1, username: "alice", email: "a@test.com" };
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), { status: 200 }),
      );

    const result = await updateCurrentUserPassword({
      password: "newSecret123",
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "newSecret123" }),
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
      updateCurrentUserPassword({ password: "short" }),
    ).rejects.toThrow("Request failed with status 400");
  });
});
