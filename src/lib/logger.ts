// ─────────────────────────────────────────────────────────────
//  AMML — Structured Logger
//  Writes JSON to /dev/shm (tmpfs — fast, persisted by Loki)
// ─────────────────────────────────────────────────────────────

const ACCESS_LOG = "/dev/shm/amml-access.log";
const ERROR_LOG  = "/dev/shm/amml-error.log";

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogEntry {
  ts: string;
  level: LogLevel;
  service: string;
  method?: string;
  path?: string;
  status?: number;
  latency_ms?: number;
  user?: string;
  action?: string;
  detail?: string;
  error?: string;
  stack?: string;
  ip?: string;
}

function write(path: string, entry: LogEntry): void {
  try {
    Bun.write(path, JSON.stringify(entry) + "\n");
  } catch { /* silent — never throw from logger */ }
}

export const logger = {
  info(method: string, path: string, status: number, latency_ms: number, user?: string) {
    write(ACCESS_LOG, {
      ts: new Date().toISOString(),
      level: "INFO",
      service: "amml-api",
      method,
      path,
      status,
      latency_ms: Math.round(latency_ms),
      user: user ?? "anonymous",
    });
  },

  warn(method: string, path: string, status: number, latency_ms: number, detail: string) {
    write(ACCESS_LOG, {
      ts: new Date().toISOString(),
      level: "WARN",
      service: "amml-api",
      method,
      path,
      status,
      latency_ms: Math.round(latency_ms),
      detail,
    });
  },

  error(method: string, path: string, error: string, stack?: string, user?: string) {
    write(ERROR_LOG, {
      ts: new Date().toISOString(),
      level: "ERROR",
      service: "amml-api",
      method,
      path,
      error,
      stack,
      user: user ?? "anonymous",
    });
  },

  // Action-level audit (for security-sensitive operations)
  audit(action: string, detail: string, user?: string, ip?: string) {
    write(ERROR_LOG, {
      ts: new Date().toISOString(),
      level: "INFO",
      service: "amml-audit",
      action,
      detail,
      user: user ?? "system",
      ip,
    });
  },
};

// ── Timing middleware helper ──────────────────────────────────
export function startTimer(): { end: () => number } {
  const start = Bun.nanoseconds();
  return { end: () => Math.round((Bun.nanoseconds() - start) / 1_000_000) };
}