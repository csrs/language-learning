import { editProfile } from "../editProfile";

const mockResponseBody = { id: 1, username: "bob", email: "bob@example.com" };

describe("editProfile", () => {
  it("sends a PATCH request with username and email", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(mockResponseBody), { status: 200 }),
      );

    const result = await editProfile("bob", "bob@example.com");

    expect(fetchSpy).toHaveBeenCalledWith("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "bob",
        email: "bob@example.com",
      }),
    });
    expect(result).toEqual(mockResponseBody);
  });

  it("throws when the response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    await expect(editProfile("bob", "bad-email")).rejects.toThrow(
      "Failed to edit profile",
    );
  });
});
