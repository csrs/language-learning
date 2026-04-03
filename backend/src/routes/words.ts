import { Router } from "express";
import { prisma } from "../../prisma/prisma.js";
import { z } from "zod";

export const router = Router();

const querySchema = z.object({
  numOfWords: z.string().max(2, { error: "Must be at most 99 characters" }),
  language: z.string().min(2).max(2, { error: "Must be exactly 2 characters" }),
});

// GET /api/words?numOfWords=10&language=en
router.get("/", async (req, res) => {
  const parseResult = querySchema.safeParse(req.query);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }
  const { numOfWords, language } = parseResult.data;
  try {
    // Look up language in Language table
    const lang = await prisma.language.findUnique({
      where: { value: language },
    });
    if (!lang) {
      return res
        .status(400)
        .json({ error: `Language '${language}' not found` });
    }
    const words = await prisma.word.findMany({
      where: { languageId: lang.id },
      take: Number(numOfWords),
      orderBy: { id: "asc" },
    });
    res.json(words);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});
