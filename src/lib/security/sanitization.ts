// ─────────────────────────────────────────────────────────────
//  Input Sanitization — P111 Default-Deny Framework
//
//  Every input field to every API route passes through these
//  validators. Never trust, always validate, always coerce.
// ─────────────────────────────────────────────────────────────

import { z } from 'zod';

// ── Core scalar schemas ──────────────────────────────────────
const NON_EMPTY_STRING = z.string().min(1, 'required').max(1024);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const schemas = {
  // ── Attendance ─────────────────────────────────────────────
  attendancePost: z.object({
    staffId:    NON_EMPTY_STRING.max(64),
    staffName:  z.string().max(256).optional(),
    market:     z.string().max(128).optional(),
    dept:       z.string().max(128).optional(),
    date:       NON_EMPTY_STRING
                 .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
    clockIn:    z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'clockIn must be HH:MM or HH:MM:SS').optional(),
    clockOut:   z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'clockOut must be HH:MM or HH:MM:SS').optional(),
    device:     z.string().max(256).optional(),
    late:       z.boolean().optional(),
    duration:   z.number().int().nonnegative().max(1440).optional(),
  }),

  attendanceQuery: z.object({
    date:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    market: z.string().max(128).optional(),
  }),

  // ── Staff ───────────────────────────────────────────────────
  staffPost: z.object({
    first:     NON_EMPTY_STRING.max(64),
    last:      NON_EMPTY_STRING.max(64),
    dept:      z.string().max(128).optional(),
    market:    z.string().max(128).optional(),
    phone:     z.string().max(32).regex(/^[\d\s\+\-\(\)]*$/, 'invalid phone format').optional(),
    role:      z.string().max(128).optional(),
    salary:    z.number().nonnegative().max(10_000_000).optional(),
    active:    z.boolean().optional(),
    authLevel: z.enum(['SUPERADMIN', 'MD', 'MANAGER', 'SUPERVISOR', 'OFFICER']).optional(),
    password:  z.string().max(256).optional(),
  }),

  // ── Device ──────────────────────────────────────────────────
  devicePost: z.object({
    name:     NON_EMPTY_STRING.max(128),
    type:     z.string().max(64).optional(),
    market:   z.string().max(128).optional(),
    serial:   NON_EMPTY_STRING.max(128),
    location: z.string().max(256).optional(),
    active:   z.boolean().optional(),
  }),

  // ── Market ─────────────────────────────────────────────────
  marketPost: z.object({
    name:     NON_EMPTY_STRING.max(128),
    location: z.string().max(256).optional(),
    manager:  z.string().max(128).optional(),
    capacity: z.number().int().nonnegative().max(100_000).optional(),
    days:     z.string().max(64).optional(),
    active:   z.boolean().optional(),
    desc:     z.string().max(512).optional(),
  }),

  // ── User ───────────────────────────────────────────────────
  userPost: z.object({
    name:      NON_EMPTY_STRING.max(128),
    authLevel: z.enum(['SUPERADMIN', 'MD', 'MANAGER', 'SUPERVISOR', 'OFFICER']),
    password:  z.string().min(6).max(256),
  }),

  // ── Payroll ────────────────────────────────────────────────
  payrollPost: z.object({
    staffId:   NON_EMPTY_STRING.max(64),
    period:    NON_EMPTY_STRING.max(32),
    basePay:  z.number().nonnegative().max(10_000_000),
    bonuses:  z.number().nonnegative().max(10_000_000).optional(),
    deductions: z.number().nonnegative().max(10_000_000).optional(),
  }),

  // ── Generic ID ─────────────────────────────────────────────
  id: z.string().regex(UUID_REGEX, 'invalid UUID format'),

  // ── Search / filter ────────────────────────────────────────
  search: z.object({
    q: z.string().max(256).optional(),
  }),
};

// ── Validation helper ────────────────────────────────────────
export type ValidationResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: string; status: 400 | 422 };

export function validate<T>(schema: z.ZodSchema<T>, input: unknown): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return {
    ok: false,
    error: firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'validation failed',
    status: 422,
  };
}

// ── Sanitize HTML to prevent XSS ────────────────────────────
/** Strips all HTML tags — use for any user-provided text rendered in the UI */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

// ── SQL identifier quoting (for dynamic column/table names) ──
/** Whitelist-based identifier validator — only alphanumeric + underscore, max 64 chars */
const IDENT_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;

export function safeIdentifier(identifier: string): string {
  if (!IDENT_REGEX.test(identifier)) {
    throw new Error(`unsafe SQL identifier: ${identifier}`);
  }
  return `"${identifier}"`;
}

// ── Order-by whitelist ──────────────────────────────────────
/** Prevents injection in ORDER BY clauses */
const SAFE_ORDER_COLUMNS = new Set([
  'id', 'name', 'date', 'clock_in', 'clock_out', 'market', 'dept',
  'staff_name', 'timestamp', 'created_at', 'active', 'last_seen',
]);

export function safeOrderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): string {
  if (!SAFE_ORDER_COLUMNS.has(column)) {
    throw new Error(`disallowed ORDER BY column: ${column}`);
  }
  return `${safeIdentifier(column)} ${direction}`;
}
