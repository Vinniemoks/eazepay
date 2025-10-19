// src/index.ts
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { AppDataSource } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { logger } from "./utils/logger";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "8000", 10);

// ---------- Middleware ----------
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// morgan -> your logger
app.use(
  morgan("combined", {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

// ---------- Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "identity-service",
    timestamp: new Date().toISOString(),
  });
});

// 404 for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// ---------- Error handling (single, centralized) ----------
app.use(errorHandler);

// ---------- DB init + server start (skipped in tests) ----------
if (process.env.NODE_ENV !== "test") {
  AppDataSource.initialize()
    .then(() => {
      logger.info("✅ Database connected successfully");
      app.listen(PORT, () => {
        logger.info(`🚀 Identity Service running on port ${PORT}`);
      });
    })
    .catch((err) => {
      logger.error("❌ Database connection failed:", err);
      process.exit(1);
    });
}

export default app;
