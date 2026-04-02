export const changePassword = async (password: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_BASE_URL}/api/me/password`, {
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
