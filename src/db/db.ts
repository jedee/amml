// ─────────────────────────────────────────────────────────────
//  AMML — Database Abstraction Layer (db.ts)
//
//  Switches between SQLite (Zo, current) and PostgreSQL (AWS RDS)
//  based on whether DATABASE_URL is set.
//
//  Usage:
//    DB_MODE=sqlite   → bun:sqlite (default)
//    DB_MODE=postgres → Bun postgres driver
//    DATABASE_URL=postgresql://...  → activates postgres mode
//
//  All routes in amml-api.ts call functions from this module only.
//  The underlying database is an implementation detail.
// ─────────────────────────────────────────────────────────────

// ── Mode detection ─────────────────────────────────────────
type DbMode = "sqlite" | "postgres";
const IS_POSTGRES = Boolean(process.env.DATABASE_URL);
const DB_MODE: DbMode = IS_POSTGRES ? "postgres" : "sqlite";

console.log(`[amml-db] mode=${DB_MODE}`);

// ── SQLite (synchronous) ───────────────────────────────────
import { Database } from "bun:sqlite";
const DB_PATH = "/home/workspace/amml/data/amml.db";

let _sqliteDb: Database | null = null;

function getSqliteDb(): Database {
  if (_sqliteDb) return _sqliteDb;
  _sqliteDb = new Database(DB_PATH, { create: true, readwrite: true });
  _sqliteDb.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  _sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS markets (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, location TEXT, manager TEXT,
      capacity INTEGER, days TEXT, active INTEGER DEFAULT 1, desc TEXT
    );
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY, first TEXT NOT NULL, last TEXT NOT NULL, dept TEXT,
      market TEXT, phone TEXT, role TEXT, salary REAL, active INTEGER DEFAULT 1,
      auth_level TEXT DEFAULT 'OFFICER', password TEXT
    );
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT, market TEXT, serial TEXT,
      location TEXT, active INTEGER DEFAULT 1, last_seen TEXT, clocks_today INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY, staff_id TEXT NOT NULL, staff_name TEXT, market TEXT, dept TEXT,
      date TEXT NOT NULL, clock_in TEXT, clock_out TEXT, device TEXT,
      late INTEGER DEFAULT 0, duration INTEGER,
      FOREIGN KEY (staff_id) REFERENCES staff(id)
    );
    CREATE TABLE IF NOT EXISTS daily_summary (
      date TEXT NOT NULL, market TEXT, staff_count INTEGER DEFAULT 0,
      present INTEGER DEFAULT 0, absent INTEGER DEFAULT 0, late INTEGER DEFAULT 0,
      on_time INTEGER DEFAULT 0, avg_clock_in TEXT, generated_at TEXT,
      PRIMARY KEY (date, market)
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY, user TEXT, action TEXT, detail TEXT, timestamp TEXT
    );
  `);
  seedIfEmpty(_sqliteDb);
  return _sqliteDb;
}

// ── Seed (only if markets table is empty) ─────────────────
function seedIfEmpty(db: Database): void {
  const count = db.query("SELECT COUNT(*) as c FROM markets").get() as { c: number };
  if (count.c > 0) return;
  const markets = [
    ["m0","Head Office","FCT Administration HQ","Onya Ojiji",50,"Mon–Fri",1,"FCT Administration HQ"],
    ["m1","Gudu Market","Gudu, FCT Abuja","Chibuzor Udekwu",150,"Mon–Sat",1,"Busy residential market"],
    ["m2","Wuse Market","Wuse Zone 5, FCT Abuja","Tolani Ofulue",200,"Mon–Sat",1,"Largest market in central Abuja"],
    ["m3","Kado Market","Kado, FCT Abuja","Daodu Susan",120,"Mon–Sat",1,"Vibrant market serving Kado Estate"],
    ["m4","Karimo Market","Karimo, FCT Abuja","Ukpabia Michael Uzoma",100,"Mon–Sat",1,"Community market"],
    ["m5","Kugbo International Market","Kugbo, FCT Abuja","Zamani Rose Thomas",300,"Daily",1,"Major international trade hub"],
    ["m6","Area 7/10 Market","Area 7/10, FCT Abuja","Bukar Musa Shuaibu",130,"Mon–Sat",1,"Mixed goods market"],
    ["m7","Garki International Market","Garki, FCT Abuja","Gloria Asogwa",250,"Mon–Sat",1,"Premier international trade market"],
    ["m8","Garki Model Market","Garki, FCT Abuja","Peace Okoh",180,"Mon–Fri",1,"Modern organised market"],
    ["m9","Zone 3 Market","Zone 3, Wuse, FCT Abuja","Adenike Dosumu",110,"Mon–Sat",1,"Neighbourhood market"],
    ["m10","Apo Zone A, D & E Shopping Complex","Apo, FCT Abuja","Ngozi Okereke",160,"Mon–Sat",1,"Shopping complex"],
    ["m11","Area 1 Market","Area 1, Garki, FCT Abuja","Sa'adatu Haruna",90,"Mon–Fri",1,"Neighbourhood market"],
    ["m12","Nyanya Market","Nyanya, FCT Abuja","Ebun Obanla",140,"Mon–Sat",1,"Key satellite market"],
  ];
  for (const m of markets) db.prepare("INSERT INTO markets VALUES (?,?,?,?,?,?,?,?)").run(...m);

  const staff = [
    ["AMML-001","Onya","Ojiji","Administration","Head Office","08034561234","Managing Director",350000,1,"MD"],
    ["AMML-002","Jedidiah","Ojeh","Administration","Head Office","08098765432","Super Admin",300000,1,"SUPERADMIN"],
    ["AMML-003","Chibuzor","Udekwu","Administration","Gudu Market","08034561234","Market Manager",180000,1,"SUPERVISOR"],
    ["AMML-004","Emeka","Nwachukwu","Market Operations","Gudu Market","08123456789","Market Officer",85000,1,"OFFICER"],
    ["AMML-005","Aisha","Yusuf","Finance","Gudu Market","07012345678","Cashier",75000,1,"OFFICER"],
    ["AMML-006","Tolani","Ofulue","Administration","Wuse Market","08056781234","Market Manager",180000,1,"SUPERVISOR"],
    ["AMML-007","Chike","Okonkwo","Market Operations","Wuse Market","09034567890","Senior Market Officer",120000,1,"OFFICER"],
    ["AMML-008","Hauwa","Suleiman","Security","Wuse Market","08167891234","Security Officer",70000,1,"OFFICER"],
    ["AMML-009","Bello","Tanko","Cleaning","Wuse Market","07056781234","Cleaning Supervisor",65000,1,"OFFICER"],
    ["AMML-010","Daodu","Susan","Administration","Kado Market","08023456789","Market Manager",180000,1,"SUPERVISOR"],
  ];
  for (const s of staff) db.prepare("INSERT INTO staff VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(...s);

  const devices = [
    ["d1","Main Gate AL325","Realand AL325","Gudu Market","SN-AL325-GD-001","Main Entrance",1,"2 min ago",28],
    ["d2","Main Gate AL325","Realand AL325","Wuse Market","SN-AL325-WS-001","Main Entrance",1,"1 min ago",47],
    ["d3","East Wing AL321","Realand AL321","Wuse Market","SN-AL321-WS-002","East Entrance",1,"5 min ago",23],
    ["d4","Main Gate AL325","Realand AL325","Kado Market","SN-AL325-KD-001","Main Entrance",1,"8 min ago",19],
    ["d5","North Gate AL321","Realand AL321","Karimo Market","SN-AL321-KM-001","North Gate",1,"3 min ago",16],
  ];
  for (const d of devices) db.prepare("INSERT INTO devices VALUES (?,?,?,?,?,?,?,?,?)").run(...d);
  console.log("[amml-db] seeded");
}

// ── PostgreSQL helpers ─────────────────────────────────────
let _pgPool: any = null;

async function getPgPool(): Promise<any> {
  if (_pgPool) return _pgPool;
  const { default: postgres } = await import("postgres");
  _pgPool = postgres(process.env.DATABASE_URL!, { max: 10, idle_timeout: 20 });
  return _pgPool;
}

export async function pgHealth(): Promise<boolean> {
  try {
    const pool = await getPgPool();
    await pool.unsafe("SELECT 1");
    return true;
  } catch { return false; }
}

// ── Public query interface (async — works for both) ─────────
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  if (DB_MODE === "postgres") {
    const pool = await getPgPool();
    return pool.unsafe(sql, params) as T[];
  }
  const db = getSqliteDb();
  const stmt = db.prepare(sql);
  return (params.length > 0 ? stmt.all(...params) : stmt.all()) as T[];
}

export async function get<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function run(
  sql: string,
  params: unknown[] = []
): Promise<void> {
  if (DB_MODE === "postgres") {
    const pool = await getPgPool();
    await pool.unsafe(sql, params);
    return;
  }
  const db = getSqliteDb();
  const stmt = db.prepare(sql);
  stmt.run(...params);
}

// ── Cache (SQLite only — PostgreSQL uses connection pool) ───
interface CacheEntry { data: unknown; expiry: number; }
const _cache = new Map<string, CacheEntry>();

export function getCached<T>(key: string): T | null {
  if (DB_MODE === "postgres") return null;
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) { _cache.delete(key); return null; }
  return entry.data as T;
}

export function setCache(key: string, data: unknown, ttl = 30_000): void {
  if (DB_MODE === "postgres") return;
  _cache.set(key, { data, expiry: Date.now() + ttl });
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) { _cache.clear(); return; }
  for (const key of Array.from(_cache.keys())) {
    if (key.includes(pattern)) _cache.delete(key);
  }
}

// ── Audit ──────────────────────────────────────────────────
export async function audit(user: string, action: string, detail: string): Promise<void> {
  try {
    await run(
      `INSERT INTO audit_log (id, "user", action, detail, timestamp) VALUES ($1, $2, $3, $4, $5)`,
      [crypto.randomUUID(), user, action, detail, new Date().toISOString()]
    );
  } catch { /* silent */ }
}

// ── Health check ───────────────────────────────────────────
export async function dbHealth(): Promise<{ ok: boolean; db: string; mode: DbMode }> {
  try {
    if (DB_MODE === "postgres") {
      const ok = await pgHealth();
      return { ok, db: "postgres", mode: DB_MODE };
    }
    getSqliteDb().query("SELECT 1").get();
    return { ok: true, db: "sqlite", mode: DB_MODE };
  } catch (e) {
    return { ok: false, db: DB_MODE, mode: DB_MODE };
  }
}

// ── Graceful shutdown ───────────────────────────────────────
process.on("beforeExit", async () => {
  if (_pgPool) { await _pgPool.end(); _pgPool = null; }
});