export const getJson = async (
  baseUrl: string,
  path: string,
  options: RequestInit = {},
) => {
  const headers = new Headers(options.headers);

  return fetch(`${baseUrl}${path}`, {
    ...options,
    method: "GET",
    headers,
  });
};

export const postJson = async (
  baseUrl: string,
  path: string,
  body: unknown,
  options: RequestInit = {},
) => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  return fetch(`${baseUrl}${path}`, {
    ...options,
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
};

export const getRequiredSessionCookie = (response: Response): string => {
  const setCookieHeader = response.headers.get("set-cookie");

  if (!setCookieHeader) {
    throw new Error("Expected a Set-Cookie header");
  }

  const firstCookiePart = setCookieHeader.split(";")[0];

  if (!firstCookiePart) {
    throw new Error("Expected a session cookie value");
  }

  return firstCookiePart;
};
