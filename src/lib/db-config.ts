import type pg from "pg";

/**
 * pg merges `connectionString` query params over explicit `ssl`, so `sslmode=require`
 * in DATABASE_URL wins and enforces strict cert verification (P1011 on Supabase pooler).
 * Strip SSL-related params and set rejectUnauthorized here instead.
 */
function sanitizeConnectionString(connectionString: string): string {
  const url = new URL(connectionString.replace(/^postgresql:/, "postgres:"));

  for (const param of ["sslmode", "sslcert", "sslkey", "sslrootcert"]) {
    url.searchParams.delete(param);
  }

  return url.toString().replace(/^postgres:/, "postgresql:");
}

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
    connectionString: sanitizeConnectionString(connectionString),
    ssl: { rejectUnauthorized: false },
  };
}
