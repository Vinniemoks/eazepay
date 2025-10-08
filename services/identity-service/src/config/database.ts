// src/config/database.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { BiometricTemplate } from "../entities/BiometricTemplate";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
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

// If you need a second data source for identity service:
export const IdentityDataSource = new DataSource({
  type: "postgres",
  host: process.env.IDENTITY_DB_HOST || process.env.DB_HOST || "localhost",
  port: parseInt(process.env.IDENTITY_DB_PORT || process.env.DB_PORT || "5432", 10),
  username: process.env.IDENTITY_DB_USER || process.env.DB_USER || "developer",
  password: process.env.IDENTITY_DB_PASS || process.env.DB_PASS || "dev_password_2024!",
  database: process.env.IDENTITY_DB_NAME || "identity_service_dev",
  entities: [], // add Identity-related entities here
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
