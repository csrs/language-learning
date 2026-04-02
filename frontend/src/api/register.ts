export const register = async (
  username: string,
  email: string,
  password: string,
) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",  credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password: password,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to register user");
  }

  return response.json();
};
