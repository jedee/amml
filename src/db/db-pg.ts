// ─────────────────────────────────────────────────────────────
//  AMML — PostgreSQL Database Layer (Future / AWS RDS)
//  Uses Bun's built-in postgres driver.
//  Activated when DATABASE_URL is set (DB_MODE=postgres).
// ─────────────────────────────────────────────────────────────

interface PgConfig {
  connectionString: string;
}

let _pool: any = null;

async function getPool(): Promise<any> {
  if (_pool) return _pool;
  const { default: postgres } = await import("postgres");
  const config: PgConfig = { connectionString: process.env.DATABASE_URL! };
  _pool = postgres(config.connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return _pool;
}

// ── Query helpers (PostgreSQL) ─────────────────────────────
// Wraps query results in the same shape as bun:sqlite .all() returns
export async function pgQuery<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const pool = await getPool();
  const result = await pool.unsafe(sql, params);
  return result as T[];
}

export async function pgGet<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await pgQuery<T>(sql, params);
  return rows[0] ?? null;
}

// ── Audit helper (PostgreSQL) ──────────────────────────────
export async function auditPg(user: string, action: string, detail: string): Promise<void> {
  try {
    const pool = await getPool();
    await pool.unsafe(
      `INSERT INTO audit_log (id, "user", action, detail, timestamp)
       VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), user, action, detail, new Date().toISOString()]
    );
  } catch { /* silent */ }
}

// ── Connection health check ─────────────────────────────────
export async function pgHealth(): Promise<boolean> {
  try {
    const pool = await getPool();
    await pool.unsafe("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

// ── Graceful shutdown ─────────────────────────────────────
process.on("beforeExit", async () => {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
});
