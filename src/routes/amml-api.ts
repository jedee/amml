// ─────────────────────────────────────────────────────────────
//  AMML — API Routes (server.ts imports this)
//  All routes start with /api/amml/*
// ─────────────────────────────────────────────────────────────
import { Hono } from "hono";
import { getDb, getCached, setCache, invalidateCache, audit } from "../db/database";
import type { Market, Staff, Device, Attendance } from "../types/models";
import type { Context } from "hono";
import { logger, startTimer } from "../lib/logger";
import { Database } from "bun:sqlite";

const api = new Hono();

// ── Timing + logging middleware ─────────────────────────────
// Wraps every request: logs method, path, status, latency, user
api.use("*", async (c, next) => {
  const timer = startTimer();
  const method = c.req.method;
  const path = c.req.path;

  // Extract user from Authorization header (Bearer token) or query
  const auth = c.req.header("authorization") ?? "";
  const user = auth.startsWith("Bearer ") ? auth.slice(7, 15) + "***" : "anonymous";

  try {
    await next();
  } catch (err) {
    logger.error(method, path, String(err), err instanceof Error ? err.stack : undefined);
    throw err;
  } finally {
    const latency = timer.end();
    const status = c.res.status;

    if (status >= 500) {
      logger.warn(method, path, status, latency, `server error on ${path}`);
    } else if (status >= 400) {
      logger.warn(method, path, status, latency, `client error`);
    } else {
      logger.info(method, path, status, latency, user);
    }
  }
});

// ── GET /api/amml/markets ──────────────────────────────────
api.get("/markets", (c) => {
  const cacheKey = "markets:all";
  const cached = getCached<Market[]>(cacheKey);
  if (cached) return c.json(cached);

  const db = getDb();
  const rows = db.query("SELECT * FROM markets ORDER BY name").all() as Record<string, unknown>[];
  const markets = rows.map(r => ({
    id: String(r.id), name: String(r.name), location: String(r.location ?? ""),
    manager: String(r.manager ?? ""), capacity: Number(r.capacity),
    days: String(r.days ?? ""), active: Boolean(r.active), desc: String(r.desc ?? ""),
  })) as Market[];

  setCache(cacheKey, markets);
  return c.json(markets);
});

// ── GET /api/amml/staff ────────────────────────────────────
api.get("/staff", (c) => {
  const cacheKey = "staff:all";
  const cached = getCached<Staff[]>(cacheKey);
  if (cached) return c.json(cached);

  const db = getDb();
  const rows = db.query("SELECT * FROM staff ORDER BY last, first").all() as Record<string, unknown>[];
  const staff = rows.map(r => ({
    id: String(r.id), first: String(r.first), last: String(r.last),
    dept: String(r.dept ?? ""), market: String(r.market ?? ""),
    phone: String(r.phone ?? ""), role: String(r.role ?? ""),
    salary: Number(r.salary), active: Boolean(r.active),
    authLevel: String(r.auth_level ?? "OFFICER"),
  })) as Staff[];

  setCache(cacheKey, staff);
  return c.json(staff);
});

// ── GET /api/amml/devices ─────────────────────────────────
api.get("/devices", (c) => {
  const cacheKey = "devices:all";
  const cached = getCached<Device[]>(cacheKey);
  if (cached) return c.json(cached);

  const db = getDb();
  const rows = db.query("SELECT * FROM devices ORDER BY market, name").all() as Record<string, unknown>[];
  const devices = rows.map(r => ({
    id: String(r.id), name: String(r.name), type: String(r.type ?? "Other"),
    market: String(r.market ?? ""), serial: String(r.serial ?? ""),
    location: String(r.location ?? ""), active: Boolean(r.active),
    lastSeen: String(r.last_seen ?? ""), clocksToday: Number(r.clocks_today ?? 0),
  })) as Device[];

  setCache(cacheKey, devices);
  return c.json(devices);
});

// ── GET /api/amml/attendance?date=YYYY-MM-DD&market=... ───
api.get("/attendance", (c) => {
  const date = c.req.query("date");
  const market = c.req.query("market");
  const cacheKey = `attendance:${date ?? "all"}:${market ?? "all"}`;
  const cached = getCached<Attendance[]>(cacheKey);
  if (cached) return c.json(cached);

  const db = getDb();
  let query = "SELECT * FROM attendance";
  const params: string[] = [];
  const conditions: string[] = [];
  if (date) { conditions.push("date = ?"); params.push(date); }
  if (market) { conditions.push("market = ?"); params.push(market); }
  if (conditions.length) query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY date DESC, staff_name";

  const rows = db.query(query).all(...params) as Record<string, unknown>[];
  const attendance = rows.map(r => ({
    id: String(r.id), staffId: String(r.staff_id), staffName: String(r.staff_name ?? ""),
    market: String(r.market ?? ""), dept: String(r.dept ?? ""),
    date: String(r.date), clockIn: String(r.clock_in ?? ""),
    clockOut: String(r.clock_out ?? ""), device: String(r.device ?? ""),
    late: Boolean(r.late), duration: Number(r.duration ?? 0),
  })) as Attendance[];

  setCache(cacheKey, attendance, 10_000); // 10s for attendance — more volatile
  return c.json(attendance);
});

// ── POST /api/amml/attendance ───────────────────────────────
api.post("/attendance", async (c) => {
  const body = await c.req.json();
  const { staffId, staffName, market, dept, date, clockIn, clockOut, device, late, duration } = body;

  if (!staffId || !date) {
    return c.json({ error: "staffId and date are required" }, 400);
  }

  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO attendance (id, staff_id, staff_name, market, dept, date, clock_in, clock_out, device, late, duration)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, staffId, staffName ?? "", market ?? "", dept ?? "",
         date, clockIn ?? "", clockOut ?? "", device ?? "",
         late ? 1 : 0, duration ?? 0);

  invalidateCache("attendance");
  audit("system", "clock_in", `Staff ${staffId} clocked in at ${clockIn}`);

  return c.json({ ok: true, id });
});

// ── GET /api/amml/summary?date=YYYY-MM-DD ─────────────────
api.get("/summary", (c) => {
  const date = c.req.query("date") ?? new Date().toISOString().slice(0, 10);
  const cacheKey = `summary:${date}`;
  const cached = getCached(cacheKey);
  if (cached) return c.json(cached);

  const db = getDb();
  const rows = db.query(
    `SELECT market, COUNT(DISTINCT staff_id) as total,
            SUM(CASE WHEN clock_in != '' THEN 1 ELSE 0 END) as present,
            SUM(CASE WHEN late = 1 THEN 1 ELSE 0 END) as late,
            AVG(substr(clock_in, 1, 5)) as avg_clock_in
     FROM attendance WHERE date = ? GROUP BY market`
  ).all(date) as Record<string, unknown>[];

  const total = rows.reduce((acc, r) => acc + Number(r.total), 0);
  const present = rows.reduce((acc, r) => acc + Number(r.present), 0);
  const absent = total - present;
  const late = rows.reduce((acc, r) => acc + Number(r.late ?? 0), 0);

  const result = { date, total, present, absent, late, markets: rows };
  setCache(cacheKey, result, 15_000);
  return c.json(result);
});

// ── GET /api/amml/health ───────────────────────────────────
api.get("/health", (c) => {
  try {
    const db = getDb();
    const ping = db.query("SELECT 1 as ok").get();
    return c.json({ ok: true, timestamp: new Date().toISOString(), db: "connected" });
  } catch (err) {
    return c.json({ ok: false, error: String(err) }, 500);
  }
});

// ── 404 handler ────────────────────────────────────────────
// Logs unknown paths
api.use("*", (c) => {
  const method = c.req.method;
  const path = c.req.path;
  logger.warn(method, path, 404, "unknown path");
  return c.json({ error: "Not Found" }, 404);
});

export default api;
