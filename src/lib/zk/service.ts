// ─────────────────────────────────────────────────────────────
//  ZK Biometric Service — wires listener → event bus → DB
//
//  Architecture:
//    ZK Device → mTLS TCP Listener
//               → Fan-out handler (setFanOutHandler)
//               → publishAttendanceEvent (Redis Pub/Sub)
//               → [attendance subscriber] → SQLite attendance table
//               → [payroll subscriber]   → recalculate payroll if threshold crossed
//               → [audit subscriber]    → audit_log table
//
//  This service module is imported and started AFTER the database
//  and Redis connections are initialized. Do NOT import this in
//  the React app bundle — it is server-only.
// ─────────────────────────────────────────────────────────────
import { createZKListener, startZKListener, setFanOutHandler, type ZKListenerServer } from './listener';
import { registerDevice } from './listener';
import { subscribeToAttendance, subscribeToHealth, publishAttendanceEvent, publishHealthEvent } from '../events/emitter';
import { getDb, audit, invalidateCache } from '../../db/database';
import type { ZKClockEvent, ZKDeviceRegistration, ZKAttendanceRecord, ZKHealthStatus } from './types';

let _server: ZKListenerServer | null = null;
let _started = false;

// ── User ID → staff mapping ──────────────────────────────────
/**
 * Maps a ZKTeco userId (numeric punch ID) to AMML staff record.
 * Built once from the zkMap in settings + staff table.
 * Re-fetched every 60s to pick up new staff without restart.
 */
const _staffCache = new Map<string, { id: string; name: string; market: string; dept: string }>();
let _staffCacheLoaded = 0;
const STAFF_CACHE_TTL_MS = 60_000;

function loadStaffCache(): void {
  if (Date.now() - _staffCacheLoaded < STAFF_CACHE_TTL_MS) return;
  try {
    const db = getDb();
    const rows = db.query('SELECT id, first, last, market, dept FROM staff').all() as {
      id: string; first: string; last: string; market: string; dept: string;
    }[];
    _staffCache.clear();
    for (const r of rows) {
      // Primary key: staff id as numeric string
      _staffCache.set(r.id, {
        id: r.id,
        name: `${r.first} ${r.last}`,
        market: r.market ?? '',
        dept: r.dept ?? '',
      });
      // Secondary: also index by first+last lowercase for devices that send names
      _staffCache.set(`${r.first} ${r.last}`.toLowerCase(), {
        id: r.id,
        name: `${r.first} ${r.last}`,
        market: r.market ?? '',
        dept: r.dept ?? '',
      });
    }
    _staffCacheLoaded = Date.now();
  } catch (err) {
    console.error('[zk-service] failed to load staff cache:', err);
  }
}

function resolveStaff(userId: string): { id: string; name: string; market: string; dept: string } | null {
  loadStaffCache();
  return _staffCache.get(userId) ?? null;
}

// ── Attendance deduplication ─────────────────────────────────
/** Track recently processed event IDs to avoid double-writing */
const _processedEvents = new Set<string>();
const PROCESSED_TTL_MS = 120_000; // 2 min window

function markProcessed(eventId: string): void {
  _processedEvents.add(eventId);
  // Prune old entries
  if (_processedEvents.size > 10_000) {
    const cutoff = Date.now() - PROCESSED_TTL_MS;
    for (const k of _processedEvents) {
      if ((k as unknown as number) < cutoff) _processedEvents.delete(k);
    }
  }
}

// ── Clock-in / clock-out deduplication ───────────────────────
const _recentClockIns = new Map<string, number>(); // staffId → timestamp
const CLOCK_IN_WINDOW_MS = 30_000; // ignore duplicate clock-ins within 30s

// ── Attendance subscriber — called by event bus ───────────────
async function handleAttendanceEvent(
  payload: ZKClockEvent & { publishedAt: string; eventId: string }
): Promise<void> {
  const { eventId, userId, timestamp, type, deviceSerial } = payload;

  // Deduplicate by eventId
  if (_processedEvents.has(eventId)) {
    console.log(`[zk-service] duplicate event skipped: ${eventId}`);
    return;
  }
  markProcessed(eventId);

  // Resolve staff
  const staff = resolveStaff(userId);
  if (!staff) {
    console.warn(`[zk-service] unknown userId ${userId} — no staff mapping`);
    audit('system', 'zk_unknown_user', `userId=${userId} serial=${deviceSerial}`);
    return;
  }

  const date = timestamp.split('T')[0];
  const time = timestamp.split('T')[1].slice(0, 5); // HH:MM

  if (type === 'check-in') {
    // Throttle: ignore rapid re-clock-ins
    const last = _recentClockIns.get(staff.id);
    if (last && Date.now() - last < CLOCK_IN_WINDOW_MS) {
      console.log(`[zk-service] clock-in throttled for ${staff.id}: ${time}`);
      return;
    }
    _recentClockIns.set(staff.id, Date.now());

    // Check if already clocked in today (missing clock-out from previous day)
    const db = getDb();
    const existing = db.query(
      `SELECT id FROM attendance WHERE staff_id = ? AND date = ? AND clock_out = ''`
    ).get(staff.id, date);
    if (existing) {
      // Staff forgot to clock out yesterday — auto-close the record
      const [h, m] = time.split(':').map(Number);
      const isLate = h * 60 + m > 8 * 60 + 30;
      db.prepare(
        `UPDATE attendance SET clock_out = ?, duration = (CAST(substr(?,1,2) AS INTEGER)*60 + CAST(substr(?,4,2) AS INTEGER)) - (CAST(substr(clock_in,1,2) AS INTEGER)*60 + CAST(substr(clock_in,4,2) AS INTEGER))
         WHERE id = ?`
      ).run('17:00', time, time, (existing as { id: string }).id);
    }

    const [h] = time.split(':').map(Number);
    const late = h * 60 + parseInt(time.slice(3), 10) > 8 * 60 + 30;
    const id = crypto.randomUUID();

    db.prepare(
      `INSERT INTO attendance (id, staff_id, staff_name, market, dept, date, clock_in, clock_out, device, late, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, '', ?, 0, NULL)`
    ).run(id, staff.id, staff.name, staff.market, staff.dept, date, time, late ? 1 : 0);

    invalidateCache('attendance');
    audit('system', 'zk_clock_in', `${staff.name} at ${time} (${deviceSerial})`);
    console.log(`[zk-service] ✓ ${staff.name} clocked in at ${time} (late=${late})`);

  } else if (type === 'check-out') {
    // Find today's open clock-in record
    const db = getDb();
    const open = db.query(
      `SELECT id, clock_in FROM attendance WHERE staff_id = ? AND date = ? AND clock_out = '' ORDER BY clock_in LIMIT 1`
    ).get(staff.id, date) as { id: string; clock_in: string } | undefined;

    if (!open) {
      console.warn(`[zk-service] check-out with no open clock-in: ${staff.id}`);
      return;
    }

    // Calculate duration
    const [ih, im] = open.clock_in.split(':').map(Number);
    const [oh, om] = time.split(':').map(Number);
    const duration = (oh * 60 + om) - (ih * 60 + im);

    db.prepare(
      `UPDATE attendance SET clock_out = ?, duration = ? WHERE id = ?`
    ).run(time, duration, open.id);

    invalidateCache('attendance');
    audit('system', 'zk_clock_out', `${staff.name} at ${time} (${deviceSerial})`);
    console.log(`[zk-service] ✓ ${staff.name} clocked out at ${time} (duration=${duration}min)`);
  }
}

// ── Health subscriber ────────────────────────────────────────
async function handleHealthEvent(
  payload: ZKHealthStatus & { publishedAt: string }
): Promise<void> {
  const { serial, connected, lastSeen, clocksToday, error } = payload;
  try {
    const db = getDb();
    db.prepare(
      `UPDATE devices SET last_seen = ?, clocks_today = ?, active = ? WHERE serial = ?`
    ).run(lastSeen, clocksToday, connected ? 1 : 0, serial);
  } catch (err) {
    console.error(`[zk-service] health update failed: ${err}`);
  }
}

// ── Bootstrap ───────────────────────────────────────────────
export async function startZKService(): Promise<void> {
  if (_started) {
    console.warn('[zk-service] already started');
    return;
  }

  // Register known devices from database
  try {
    const db = getDb();
    const devices = db.query(
      `SELECT serial, name, market, location FROM devices WHERE active = 1`
    ).all() as { serial: string; name: string; market: string; location: string }[];

    for (const d of devices) {
      registerDevice({
        serial: d.serial,
        name: d.name,
        ipAddress: '0.0.0.0',       // determined at connection time
        port: 4370,
        market: d.market,
        location: d.location,
        issuerFingerprint: '',       // set via env ZK_DEVICE_CA_FINGERPRINT
        clockSkewMs: 300_000,
        lastAuthenticated: null,
      });
    }
    console.log(`[zk-service] registered ${devices.length} devices`);
  } catch (err) {
    console.error('[zk-service] device registration failed:', err);
  }

  // Wire fan-out → event bus
  setFanOutHandler(async (event: ZKClockEvent) => {
    await publishAttendanceEvent(event);
  });

  // Subscribe to attendance events
  await subscribeToAttendance(handleAttendanceEvent);

  // Subscribe to health events
  await subscribeToHealth(handleHealthEvent);

  // Start TCP/mTLS listener
  const server = createZKListener();
  await startZKListener(server);
  _server = server;
  _started = true;

  console.log('[zk-service] started — ZK push listener + event bus active');
}

export function stopZKService(): void {
  _server?.close();
  _server = null;
  _started = false;
  console.log('[zk-service] stopped');
}
