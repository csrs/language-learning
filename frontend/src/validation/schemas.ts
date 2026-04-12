import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, { error: "Must be at least 2 characters" })
      .max(20, { error: "Must be at most 20 characters" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "Must be a valid email" })),
    password: z.string().min(8, { error: "Must be at least 8 characters" }),
  })
  .strict();

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, { error: "Must be at least 2 characters" })
    .max(20, { error: "Must be at most 20 characters" }),
  password: z.string().min(8, { error: "Must be at least 8 characters" }),
});

export const editProfileSchema = z
  .object({
    username: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .trim()
        .min(2, { error: "Must be at least 2 characters" })
        .max(20, { error: "Must be at most 20 characters" })
        .optional(),
    ),
    email: z.preprocess(
      (val) => (val === "" ? undefined : val),
      z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email({ error: "Must be a valid email" }))
        .optional(),
    ),
  })
  .refine((data) => data.username !== undefined || data.email !== undefined, {
    error: "At least one of username or email must be provided",
  });

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, { error: "Must be at least 8 characters" }),
  })
  .strict();

export const getDetailsByValueRequestSchema = z.object({
  value: z.string().trim().min(1, { error: "Must be at least one character" }),
  language: z.enum(["de", "en"]),
});
