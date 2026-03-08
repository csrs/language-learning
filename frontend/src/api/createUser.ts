export async function createUser(
  username: string,
  email: string,
  password_hash: string,
) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      email: email,
      password_hash: password_hash,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
}
