import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

function createPool() {
  const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

  if (!DB_HOST || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw new Error("Database environment variables are incomplete.");
  }

  return new Pool({
    host: DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export const db = globalForPg.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = db;
}
