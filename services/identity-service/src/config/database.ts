// src/config/database.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { BiometricTemplate } from "../entities/BiometricTemplate";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "developer",
  password: process.env.DB_PASS || "dev_password_2024!",
  database: process.env.DB_NAME || "afripay_dev",
  entities: [User, BiometricTemplate],
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
