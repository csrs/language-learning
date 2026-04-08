import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";

import { router as authRouter } from "./routes/auth.js";
import { router as meRouter } from "./routes/me.js";
import { router as wordsRouter } from "./routes/words.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          // Allow no origin (Postman doesn't send an 'origin' header)
          !origin ||
          // Allow localhost
          origin === "http://localhost:5173" ||
          origin === "http://localhost:3000" ||
          // Allow Vercel domains matching the pattern
          /^https:\/\/language-learning-.*\.vercel\.app$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/api/me", meRouter);
  app.use("/api/words", wordsRouter);
  app.use("/api/auth", authRouter);

  app.use((req, res) => {
    res.status(404).json({
      error: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      void _next;
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
};

const app = createApp();

export default app;
