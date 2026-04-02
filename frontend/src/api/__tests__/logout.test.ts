import { logout } from "./logout";

describe("logout", () => {
  it("sends a POST request to the login endpoint", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "logged out" }), {
          status: 200,
        }),
      );

    const result = await logout();

    expect(fetchSpy).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    expect(result).toEqual({ message: "logged out" });
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 }),
    );

    await expect(logout()).rejects.toThrow("Failed to logout user");
  });
});
