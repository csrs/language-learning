import { Prisma } from "@prisma/client";
import { Router } from "express";

import { prisma } from "../../prisma/prisma.js";
import { createPasswordHash } from "../lib/password.js";
import z from "zod";

export const router = Router();

const createUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, { error: "must be at least 2 characters" })
      .max(20, { error: "must be at most 20 characters" }),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: "must be a valid email" })),
    password: z.string().min(8, { error: "must be at least 8 characters" }),
  })
  .strict();

router.post("/create", async (req, res) => {
  const parsedBody = createUserSchema.safeParse(req.body);

  if (!parsedBody.success) {
    const flattenedError = z.flattenError(parsedBody.error);

    return res.status(400).json({
      formErrors: flattenedError.formErrors,
      fieldErrors: flattenedError.fieldErrors,
    });
  }

  const { username, email, password } = parsedBody.data;

  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash: await createPasswordHash(password),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        error: "A user with that username or email already exists",
      });
    }

    throw error;
  }
});
