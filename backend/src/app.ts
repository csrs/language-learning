import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";

import { router as authRouter } from "./routes/auth.js";
import { router as meRouter } from "./routes/me.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://language-learning-iota.vercel.app",
      ],
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    }),
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use("/api/me", meRouter);
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
