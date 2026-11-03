
import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }

  return new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
}

export const db = globalForPg.pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = db;
}
