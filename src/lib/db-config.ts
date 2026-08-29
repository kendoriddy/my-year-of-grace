import type pg from "pg";

/**
 * Pool config for Supabase (shared pooler) + Prisma driver adapter.
 * Supabase requires TLS; Vercel/Node can reject the cert chain (P1011) unless
 * rejectUnauthorized is false. Traffic is still encrypted.
 */
export function getPgPoolConfig(): pg.PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return {
    connectionString,
    ssl: { rejectUnauthorized: false },
  };
}
