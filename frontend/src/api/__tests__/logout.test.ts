import { logoutUser } from "../generated/endpoints/auth/auth";

describe("logout", () => {
  it("sends a POST request to the logout endpoint", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );

    const result = await logoutUser();

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
    });
    expect(result).toEqual({
      data: undefined,
      status: 204,
      headers: expect.any(Headers),
    });
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    await expect(logoutUser()).rejects.toThrow(
      "Request failed with status 500",
    );
  });
});
