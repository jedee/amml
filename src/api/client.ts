// ─────────────────────────────────────────────────────────────
//  AMML API Client — authenticated fetch wrapper
//
//  Reads AMML_API_SECRET from sessionStorage on first call.
//  sessionStorage (not localStorage) reduces XSS exposure.
//  All requests include Bearer token + Accept: application/json.
// ─────────────────────────────────────────────────────────────
const API_SECRET_KEY = 'amml_api_secret';
const API_BASE = '/api/amml';

/**
 * Store the API secret after initial setup or login.
 * Call this once when the secret is first available.
 */
export function setApiSecret(secret: string): void {
  try { sessionStorage.setItem(API_SECRET_KEY, secret); } catch { /* ignore */ }
}

/** Remove secret on logout. */
export function clearApiSecret(): void {
  try { sessionStorage.removeItem(API_SECRET_KEY); } catch { /* ignore */ }
}

/** Check if a secret is stored. */
export function hasApiSecret(): boolean {
  try { return sessionStorage.getItem(API_SECRET_KEY) !== null; } catch { return false; }
}

/**
 * Make an authenticated AMML API call.
 * Automatically includes Authorization: Bearer <secret>.
 * Throws if the secret is not set.
 */
export async function apiClient<T = unknown>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const secret = tryGetSecret();
  if (!secret) throw new ApiClientError('AMML_API_SECRET not set. Cannot call protected route.');

  const url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;

  const res = await fetch(url, {
    ...opts,
    headers: {
      ...opts.headers,
      Authorization: `Bearer ${secret}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new ApiClientError(`API ${res.status} on ${path}: ${body}`, res.status);
  }

  // Handle empty responses (204 No Content)
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

function tryGetSecret(): string | null {
  try { return sessionStorage.getItem(API_SECRET_KEY); } catch { return null; }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}
