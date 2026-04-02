export const editProfile = async (username: string, email: string) => {
  const response = await fetch("/api/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      email: email,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to edit profile");
  }

  return response.json();
};
