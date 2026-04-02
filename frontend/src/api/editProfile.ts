export const editProfile = async (username: string, email: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_BASE_URL}/api/me`, {
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
