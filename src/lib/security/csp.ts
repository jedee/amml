// ─────────────────────────────────────────────────────────────
//  Security Middleware — applied to all Hono routes
//
//  P111: Default-deny input security layer
//  P110: Layered defense — this is the application layer
// ─────────────────────────────────────────────────────────────
import type { Context } from 'hono';

// ── CSP Header ───────────────────────────────────────────────
/**
 * Content-Security-Policy header — mitigates XSS and injection.
 * Configured for Hono's SPA serving model.
 */
export const CSP_HEADER = [
  "default-src 'self'",
  // Allow Google Fonts (Outfit + Libre Baskerville)
  "font-src 'self' https://fonts.gstatic.com",
  // Allow CDN scripts that the legacy amml.html relies on
  "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.groq.com https://fonts.googleapis.com https://fonts.gstatic.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

/** Headers applied to every response */
export function securityHeaders(c: Context): void {
  c.res.headers.set('Content-Security-Policy', CSP_HEADER);
  c.res.headers.set('X-Content-Type-Options', 'nosniff');
  c.res.headers.set('X-Frame-Options', 'DENY');
  c.res.headers.set('X-XSS-Protection', '1; mode=block');
  c.res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  c.res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

// ── Request ID middleware ───────────────────────────────────
/** Injects a unique request ID for tracing */
export function requestIdHeader(c: Context): void {
  const reqId = crypto.randomUUID().slice(0, 8);
  c.res.headers.set('X-Request-ID', reqId);
  c.env.set('REQUEST_ID', reqId);
}

// ── Body size limits ────────────────────────────────────────
export const MAX_BODY_SIZE = '1mb';
