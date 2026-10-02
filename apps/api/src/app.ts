import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./shared/middleware/error-handler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  // Feature modules get mounted here, e.g. app.use("/auth", authRouter)

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}