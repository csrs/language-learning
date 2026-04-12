import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";

import { router as authRouter } from "./routes/auth.js";
import { router as docsRouter } from "./routes/docs.js";
import { router as meRouter } from "./routes/me.js";
import { router as wordsRouter } from "./routes/words.js";

const CORS_BLOCKED_ERROR_MESSAGE = "Not allowed by CORS";

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
          // Allow the configured Render deployment origin
          origin === process.env.RENDER_EXTERNAL_URL ||
          // Allow Vercel domains matching the pattern
          /^https:\/\/language-learning-.*\.vercel\.app$/.test(origin)
        ) {
          return callback(null, true);
        } else {
          return callback(new Error(CORS_BLOCKED_ERROR_MESSAGE));
        }
      },
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/api/docs", docsRouter);
  app.use("/api/me", meRouter);
  app.use("/api/allWords", wordsRouter);
  app.use("/api/auth", authRouter);

  // If any other URL is requested, return a 404 error because the only routes in this application are the ones listed
  app.use((req, res) => {
    res.status(404).json({
      error: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  app.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
      void _next; // _next is not used, but Express requires it in this for it to be considered as middleware
      void _req;
      if (
        error instanceof Error &&
        error.message === CORS_BLOCKED_ERROR_MESSAGE
      ) {
        return res.status(403).json({ error: CORS_BLOCKED_ERROR_MESSAGE });
      }

      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
};

const app = createApp();

export default app;
