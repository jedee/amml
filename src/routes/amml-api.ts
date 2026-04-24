// ─────────────────────────────────────────────────────────────
//  AMML — API Routes
//  All routes start with /api/amml/*
//  Uses db.ts abstraction: query(), get(), run(), cache functions
//  DB_MODE=postgres activates PostgreSQL; otherwise uses SQLite
// ─────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { query, get, run, getCached, setCache, invalidateCache, dbHealth } from "../db/db";
import type { Market, Staff, Device, Attendance } from "../types/models";
import { logger, startTimer } from "../lib/logger";
import { timingSafeEqual } from "node:crypto";

const api = new Hono();

// ── Timing + logging ─────────────────────────────────────────
api.use("*", async (c, next) => {
  const timer = startTimer();
  const method = c.req.method;
  const path = c.req.path;
  try {
    await next();
  } finally {
    logger.info(method, path, c.res.status, timer.end());
  }
});

// ── Auth gate ───────────────────────────────────────────────
const AMML_API_SECRET = process.env.AMML_API_SECRET ?? "dev-secret-change-me";

api.use("*", async (c, next) => {
  const path = c.req.path;
  // health and diagnostic are public
  if (path === "/health" || path === "/diagnostic") return next();

  const auth = c.req.header("authorization");
  if (!auth?.startsWith("Bearer ")) return c.json({ error: "Unauthorized" }, 401);
  const token = auth.slice(7);
  const a = Buffer.from(token), b = Buffer.from(AMML_API_SECRET);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return c.json({ error: "Unauthorized" }, 401);
  return next();
});

// ── GET /api/amml/health ───────────────────────────────────
api.get("/health", async (c) => {
  const status = await dbHealth();
  if (!status.ok) return c.json({ ok: false, db: status.db }, 500);
  return c.json({ ok: true, ts: new Date().toISOString(), db: status.db, mode: status.mode });
});

// ── GET /api/amml/markets ──────────────────────────────────
api.get("/markets", async (c) => {
  const cached = getCached<Market[]>("markets:all");
  if (cached) return c.json(cached);

  const rows = await query<Record<string, unknown>>("SELECT * FROM markets ORDER BY name");
  const markets = rows.map(r => ({
    id: String(r.id), name: String(r.name), location: String(r.location ?? ""),
    manager: String(r.manager ?? ""), capacity: Number(r.capacity),
    days: String(r.days ?? ""), active: Boolean(r.active), desc: String(r.desc ?? ""),
  })) as Market[];

  setCache("markets:all", markets);
  return c.json(markets);
});

// ── GET /api/amml/staff ────────────────────────────────────
api.get("/staff", async (c) => {
  const cached = getCached<Staff[]>("staff:all");
  if (cached) return c.json(cached);

  const rows = await query<Record<string, unknown>>("SELECT * FROM staff ORDER BY last, first");
  const staff = rows.map(r => ({
    id: String(r.id), first: String(r.first), last: String(r.last),
    dept: String(r.dept ?? ""), market: String(r.market ?? ""),
    phone: String(r.phone ?? ""), role: String(r.role ?? ""),
    salary: Number(r.salary), active: Boolean(r.active),
    authLevel: String(r.auth_level ?? "OFFICER"),
  })) as Staff[];

  setCache("staff:all", staff);
  return c.json(staff);
});

// ── GET /api/amml/devices ─────────────────────────────────
api.get("/devices", async (c) => {
  const cached = getCached<Device[]>("devices:all");
  if (cached) return c.json(cached);

  const rows = await query<Record<string, unknown>>("SELECT * FROM devices ORDER BY market, name");
  const devices = rows.map(r => ({
    id: String(r.id), name: String(r.name), type: String(r.type ?? "Other"),
    market: String(r.market ?? ""), serial: String(r.serial ?? ""),
    location: String(r.location ?? ""), active: Boolean(r.active),
    lastSeen: String(r.last_seen ?? ""), clocksToday: Number(r.clocks_today ?? 0),
  })) as Device[];

  setCache("devices:all", devices);
  return c.json(devices);
});

// ── GET /api/amml/attendance ───────────────────────────────
api.get("/attendance", async (c) => {
  const date = c.req.query("date");
  const market = c.req.query("market");
  const cacheKey = `att:${date ?? "all"}:${market ?? "all"}`;
  const cached = getCached<Attendance[]>(cacheKey);
  if (cached) return c.json(cached);

  let sql = "SELECT * FROM attendance";
  const params: string[] = [];
  if (date) { sql += " WHERE date = ?"; params.push(date); }
  if (market) { sql += (date ? " AND" : " WHERE") + " market = ?"; params.push(market); }
  sql += " ORDER BY date DESC, staff_name";

  const rows = await query<Record<string, unknown>>(sql, params);
  const att = rows.map(r => ({
    id: String(r.id), staffId: String(r.staff_id), staffName: String(r.staff_name ?? ""),
    market: String(r.market ?? ""), dept: String(r.dept ?? ""),
    date: String(r.date), clockIn: String(r.clock_in ?? ""),
    clockOut: String(r.clock_out ?? ""), device: String(r.device ?? ""),
    late: Boolean(r.late), duration: Number(r.duration ?? 0),
  })) as Attendance[];

  setCache(cacheKey, att, 10_000);
  return c.json(att);
});

// ── POST /api/amml/attendance ───────────────────────────────
api.post("/attendance", async (c) => {
  const body = await c.req.json();
  const { staffId, staffName, market, dept, date, clockIn, clockOut, device, late, duration } = body;
  if (!staffId || !date) return c.json({ error: "staffId and date required" }, 400);

  const id = crypto.randomUUID();
  await run(
    `INSERT INTO attendance (id,staff_id,staff_name,market,dept,date,clock_in,clock_out,device,late,duration) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, staffId, staffName ?? "", market ?? "", dept ?? "", date,
     clockIn ?? "", clockOut ?? "", device ?? "", late ? 1 : 0, duration ?? 0]
  );

  invalidateCache("att:");
  const { audit } = await import("../db/db");
  audit("system", "clock_in", `Staff ${staffId} clocked in at ${clockIn}`);

  return c.json({ ok: true, id });
});

// ── GET /api/amml/summary ───────────────────────────────────
api.get("/summary", async (c) => {
  const date = c.req.query("date") ?? new Date().toISOString().slice(0, 10);
  const cached = getCached<unknown>(`summary:${date}`);
  if (cached) return c.json(cached);

  const rows = await query<Record<string, unknown>>(
    `SELECT market,COUNT(DISTINCT staff_id) as total,
     SUM(CASE WHEN clock_in!='' THEN 1 ELSE 0 END) as present,
     SUM(CASE WHEN late=1 THEN 1 ELSE 0 END) as late
     FROM attendance WHERE date=? GROUP BY market`,
    [date]
  );

  const result = {
    date,
    total: rows.reduce((a, r) => a + Number(r.total), 0),
    present: rows.reduce((a, r) => a + Number(r.present), 0),
    markets: rows,
  };
  setCache(`summary:${date}`, result, 15_000);
  return c.json(result);
});

// ── 404 handler ────────────────────────────────────────────
api.use("*", (c) => c.json({ error: "Not Found" }, 404));

export default api;