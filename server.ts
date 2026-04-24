import { serveStatic } from "hono/bun";
import type { ViteDevServer } from "vite";
import { createServer as createViteServer } from "vite";
import config from "./zosite.json";
import { Hono } from "hono";
import { query, get, run, getCached, setCache, invalidateCache, dbHealth } from "./src/db/db";
import type { Market, Staff, Device, Attendance } from "./src/types/models";
import { logger, startTimer } from "./src/lib/logger";
import { timingSafeEqual } from "node:crypto";
import crypto from "node:crypto";

type Mode = "development" | "production";
const app = new Hono();

const mode: Mode = process.env.NODE_ENV === "production" ? "production" : "development";
const AMML_API_SECRET = process.env.AMML_API_SECRET ?? "dev-secret-change-me";

// ── API Routes (uses db.ts abstraction — async) ────────────────
function registerApiRoutes(app: Hono) {
  console.log("[routes] registerApiRoutes CALLED");
  // Simple test — no middleware, no auth
  app.get("/test", (c) => c.json({ ok: true, msg: "registerApiRoutes is live" }));
  console.log("[routes] /test route registered");

  // Auth middleware
  app.use("/api/amml/*", async (c, next) => {
    const path = c.req.path;
    if (path === "/api/amml/health") return next();
    const auth = c.req.header("authorization");
    if (!auth?.startsWith("Bearer ")) return c.json({ error: "Unauthorized" }, 401);
    const token = auth.slice(7);
    const a = Buffer.from(token), b = Buffer.from(AMML_API_SECRET);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return c.json({ error: "Unauthorized" }, 401);
    return next();
  });

  app.get("/api/amml/health", async (c) => {
    const status = await dbHealth();
    if (!status.ok) return c.json({ ok: false, db: status.db }, 500);
    return c.json({ ok: true, ts: new Date().toISOString(), db: status.db, mode: status.mode });
  });

  app.get("/api/amml/markets", async (c) => {
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

  app.get("/api/amml/staff", async (c) => {
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

  app.get("/api/amml/devices", async (c) => {
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

  app.get("/api/amml/attendance", async (c) => {
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

  app.post("/api/amml/attendance", async (c) => {
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
    const { audit } = await import("./src/db/db");
    audit("system", "clock_in", `Staff ${staffId} clocked in at ${clockIn}`);
    return c.json({ ok: true, id });
  });

  app.get("/api/amml/summary", async (c) => {
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
}

if (mode === "production") {
  registerApiRoutes(app);   // register FIRST — more specific routes win
  configureProduction(app);
} else {
  await configureDevelopment(app);
  registerApiRoutes(app);
}

const port = process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : mode === "production"
    ? (config.publish?.published_port ?? config.local_port)
    : config.local_port;

export default { fetch: app.fetch, port, idleTimeout: 255 };

// ── Production ─────────────────────────────────────────────
function configureProduction(app: Hono) {
  app.use("/assets/*", serveStatic({ root: "./dist" }));
  app.get("/favicon.ico", (c) => c.redirect("/favicon.svg", 302));
  // Explicit SPA routes — no wildcard catchall to avoid routing conflicts
  app.get("/", async (c) => {
    const f = Bun.file("./dist/index.html");
    return new Response(f, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  });
  // SPA for any non-API, non-asset path
  app.get("/:path*", async (c) => {
    const path = c.req.path;
    if (path.startsWith("/api/") || path.startsWith("/assets/")) {
      return c.text("Not Found", 404);
    }
    // Check if it's a real public file
    const pub = Bun.file(`./public${path}`);
    if (await pub.exists()) {
      const s = await pub.stat();
      if (s && !s.isDirectory()) return new Response(pub);
    }
    return new Response(Bun.file("./dist/index.html"), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  });
}

// ── Development ────────────────────────────────────────────
async function configureDevelopment(app: Hono): Promise<ViteDevServer> {
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  app.use("*", async (c, next) => {
    if (c.req.path === "/favicon.ico") return c.redirect("/favicon.svg", 302);
    const url = c.req.path;
    if (url === "/" || url === "/index.html") {
      let template = await Bun.file("./index.html").text();
      template = await vite.transformIndexHtml(url, template);
      return c.html(template, { headers: { "Cache-Control": "no-store, must-revalidate" } });
    }
    const pf = Bun.file(`./public${url}`);
    if (await pf.exists()) {
      const s = await pf.stat();
      if (s && !s.isDirectory()) return new Response(pf);
    }
    let result;
    try { result = await vite.transformRequest(url); } catch { result = null; }
    if (result) {
      return new Response(result.code, {
        headers: {
          "Content-Type": url.endsWith(".css") ? "text/css" : "application/javascript",
          "Cache-Control": "no-store, must-revalidate",
        },
      });
    }
    const idx = Bun.file("./dist/index.html");
    if (await idx.exists()) {
      return new Response(idx, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    return c.text("AMML not found", 404);
  });
  return vite;
}
