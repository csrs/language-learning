export const changePassword = async (password: string) => {
  const response = await fetch("/api/me/password", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to edit password");
  }

  return response.json();
};
