export const register = async (
  username: string,
  email: string,
  password: string,
) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
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
