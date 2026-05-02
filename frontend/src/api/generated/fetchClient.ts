type RequestMethod = "get" | "put" | "patch" | "post" | "delete";

export interface RequestConfig<Data = unknown> {
  url: string;
  method: RequestMethod;
  params?: Record<string, unknown>;
  data?: Data;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export type ErrorType<Error> = Error;

export const apiFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const response = await fetch(url, options);

  const body = [204, 205, 304].includes(response.status)
    ? null
    : await response.text();

  const data = body ? JSON.parse(body) : undefined;

  if (!response.ok) {
    throw new Error(
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : `Request failed with status ${response.status}`,
    );
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};
