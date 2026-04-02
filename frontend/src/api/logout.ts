export const logout = async () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to logout user");
  }

  return response.json();
};
