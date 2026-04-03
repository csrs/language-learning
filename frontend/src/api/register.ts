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
    const body: { error?: string } | null = await response
      .json()
      .catch((): null => null);
    throw new Error(body?.error ?? "Failed to register user");
  }

  return response.json();
};
