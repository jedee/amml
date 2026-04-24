// ─────────────────────────────────────────────────────────────
//  AMML — Drizzle ORM Schema
//  Single source of truth for all table definitions.
//  Generates SQLite migrations (dev) and PostgreSQL migrations (prod).
// ─────────────────────────────────────────────────────────────
import {
  sqliteTable,
  text,
  integer as sqliteInt,
  real,
  primaryKey,
  notNull,
} from "drizzle-orm/sqlite-core";
import {
  pgTable,
  varchar,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

// ── SQLite schema (dev / Zo primary) ──────────────────────
export const marketsSqlite = sqliteTable("markets", {
  id: text("id"). primaryKey(),
  name: text("name"). notNull(),
  location: text("location"),
  manager: text("manager"),
  capacity: sqliteInt("capacity"),
  days: text("days"),
  active: sqliteInt("active"). default(1),
  desc: text("desc"),
});

export const staffSqlite = sqliteTable("staff", {
  id: text("id"). primaryKey(),
  first: text("first"). notNull(),
  last: text("last"). notNull(),
  dept: text("dept"),
  market: text("market"),
  phone: text("phone"),
  role: text("role"),
  salary: real("salary"),
  active: sqliteInt("active"). default(1),
  authLevel: text("auth_level"). default("OFFICER"),
  password: text("password"),
});

export const devicesSqlite = sqliteTable("devices", {
  id: text("id"). primaryKey(),
  name: text("name"). notNull(),
  type: text("type"),
  market: text("market"),
  serial: text("serial"),
  location: text("location"),
  active: sqliteInt("active"). default(1),
  lastSeen: text("last_seen"),
  clocksToday: sqliteInt("clocks_today"). default(0),
});

export const attendanceSqlite = sqliteTable("attendance", {
  id: text("id"). primaryKey(),
  staffId: text("staff_id"). notNull(),
  staffName: text("staff_name"),
  market: text("market"),
  dept: text("dept"),
  date: text("date"). notNull(),
  clockIn: text("clock_in"),
  clockOut: text("clock_out"),
  device: text("device"),
  late: sqliteInt("late"). default(0),
  duration: sqliteInt("duration"),
});

export const dailySummarySqlite = sqliteTable("daily_summary", {
  date: text("date"). notNull(),
  market: text("market"),
  staffCount: sqliteInt("staff_count"). default(0),
  present: sqliteInt("present"). default(0),
  absent: sqliteInt("absent"). default(0),
  late: sqliteInt("late"). default(0),
  onTime: sqliteInt("on_time"). default(0),
  avgClockIn: text("avg_clock_in"),
  generatedAt: text("generated_at"),
});

export const auditLogSqlite = sqliteTable("audit_log", {
  id: text("id"). primaryKey(),
  user: text("user"),
  action: text("action"),
  detail: text("detail"),
  timestamp: text("timestamp"),
});

// ── PostgreSQL schema (prod / AWS RDS) ────────────────────
// Salary stored as INTEGER (kobo) to avoid floating-point errors in NGN
export const marketsPg = pgTable("markets", {
  id: varchar("id", { length: 20 }). primaryKey(),
  name: varchar("name", { length: 200 }). notNull(),
  location: varchar("location", { length: 300 }),
  manager: varchar("manager", { length: 200 }),
  capacity: integer("capacity"),
  days: varchar("days", { length: 50 }),
  active: integer("active"). default(1),
  desc: varchar("desc", { length: 500 }),
});

export const staffPg = pgTable("staff", {
  id: varchar("id", { length: 20 }). primaryKey(),
  first: varchar("first", { length: 100 }). notNull(),
  last: varchar("last", { length: 100 }). notNull(),
  dept: varchar("dept", { length: 100 }),
  market: varchar("market", { length: 200 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 100 }),
  salary: integer("salary"), // kobo
  active: integer("active"). default(1),
  authLevel: varchar("auth_level", { length: 20 }). default("OFFICER"),
  password: varchar("password", { length: 255 }),
});

export const devicesPg = pgTable("devices", {
  id: varchar("id", { length: 20 }). primaryKey(),
  name: varchar("name", { length: 200 }). notNull(),
  type: varchar("type", { length: 100 }),
  market: varchar("market", { length: 200 }),
  serial: varchar("serial", { length: 100 }),
  location: varchar("location", { length: 200 }),
  active: integer("active"). default(1),
  lastSeen: varchar("last_seen", { length: 100 }),
  clocksToday: integer("clocks_today"). default(0),
});

export const attendancePg = pgTable("attendance", {
  id: varchar("id", { length: 40 }). primaryKey(),
  staffId: varchar("staff_id", { length: 20 }). notNull(),
  staffName: varchar("staff_name", { length: 200 }),
  market: varchar("market", { length: 200 }),
  dept: varchar("dept", { length: 100 }),
  date: varchar("date", { length: 10 }). notNull(), // YYYY-MM-DD
  clockIn: varchar("clock_in", { length: 8 }),
  clockOut: varchar("clock_out", { length: 8 }),
  device: varchar("device", { length: 200 }),
  late: integer("late"). default(0),
  duration: integer("duration"),
});

export const dailySummaryPg = pgTable("daily_summary", {
  date: varchar("date", { length: 10 }). notNull(),
  market: varchar("market", { length: 200 }),
  staffCount: integer("staff_count"). default(0),
  present: integer("present"). default(0),
  absent: integer("absent"). default(0),
  late: integer("late"). default(0),
  onTime: integer("on_time"). default(0),
  avgClockIn: varchar("avg_clock_in", { length: 8 }),
  generatedAt: varchar("generated_at", { length: 30 }),
});

export const auditLogPg = pgTable("audit_log", {
  id: varchar("id", { length: 40 }). primaryKey(),
  user: varchar("user", { length: 200 }),
  action: varchar("action", { length: 100 }),
  detail: text("detail"),
  timestamp: varchar("timestamp", { length: 30 }),
});
