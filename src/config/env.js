import "dotenv/config";

export const env = {
  PORT: parseInt(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret-do-not-use-in-production",
  DATABASE_URL: process.env.DATABASE_URL,
};
