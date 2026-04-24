// ─────────────────────────────────────────────────────────────
//  AMML — SQLite Schema (dev / Zo primary)
//  Used by drizzle-kit for SQLite migrations.
//  Run: bunx drizzle-kit generate --config drizzle.sqlite.config.ts
// ─────────────────────────────────────────────────────────────
import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
  notNull,
} from "drizzle-orm/sqlite-core";

export const marketsSqlite = sqliteTable("markets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  manager: text("manager"),
  capacity: integer("capacity"),
  days: text("days"),
  active: integer("active").default(1),
  desc: text("desc"),
});

export const staffSqlite = sqliteTable("staff", {
  id: text("id").primaryKey(),
  first: text("first").notNull(),
  last: text("last").notNull(),
  dept: text("dept"),
  market: text("market"),
  phone: text("phone"),
  role: text("role"),
  salary: real("salary"),
  active: integer("active").default(1),
  authLevel: text("auth_level").default("OFFICER"),
  password: text("password"),
});

export const devicesSqlite = sqliteTable("devices", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type"),
  market: text("market"),
  serial: text("serial"),
  location: text("location"),
  active: integer("active").default(1),
  lastSeen: text("last_seen"),
  clocksToday: integer("clocks_today").default(0),
});

export const attendanceSqlite = sqliteTable("attendance", {
  id: text("id").primaryKey(),
  staffId: text("staff_id").notNull(),
  staffName: text("staff_name"),
  market: text("market"),
  dept: text("dept"),
  date: text("date").notNull(),
  clockIn: text("clock_in"),
  clockOut: text("clock_out"),
  device: text("device"),
  late: integer("late").default(0),
  duration: integer("duration"),
});

export const dailySummarySqlite = sqliteTable("daily_summary", {
  date: text("date").notNull(),
  market: text("market"),
  staffCount: integer("staff_count").default(0),
  present: integer("present").default(0),
  absent: integer("absent").default(0),
  late: integer("late").default(0),
  onTime: integer("on_time").default(0),
  avgClockIn: text("avg_clock_in"),
  generatedAt: text("generated_at"),
});

export const auditLogSqlite = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  user: text("user"),
  action: text("action"),
  detail: text("detail"),
  timestamp: text("timestamp"),
});