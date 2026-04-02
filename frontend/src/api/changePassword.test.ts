import { changePassword } from "./changePassword";

describe("changePassword", () => {
  it("sends a PATCH request with the new password", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ message: "updated" }), { status: 200 }),
      );

    const result = await changePassword("newSecret123");

    expect(fetchSpy).toHaveBeenCalledWith("/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "newSecret123" }),
    });
    expect(result).toEqual({ message: "updated" });
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    await expect(changePassword("short")).rejects.toThrow(
      "Failed to edit password",
    );
  });
});
