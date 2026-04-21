// ─────────────────────────────────────────────────────────────
//  AMML — API Client with automatic cache invalidation
//  Wraps fetch calls; invalidates in-memory cache on writes
// ─────────────────────────────────────────────────────────────

import type { Market, Staff, Device, Attendance, PayrollRecord } from '../types/models';

const BASE = '/api/amml';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error ?? `HTTP ${res.status}` };
    return { data: json as T };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

// ── Markets ─────────────────────────────────────────────────
export async function apiGetMarkets() { return apiFetch<{ markets: Market[] }>('/markets'); }
export async function apiAddMarket(market: Omit<Market, 'id'>) {
  const r = await apiFetch<{ market: Market }>('/markets', { method: 'POST', body: JSON.stringify(market) });
  return r;
}

// ── Staff ───────────────────────────────────────────────────
export async function apiGetStaff() { return apiFetch<{ staff: Staff[] }>('/staff'); }
export async function apiAddStaff(staff: Omit<Staff, 'id'>) {
  return apiFetch<{ staff: Staff }>('/staff', { method: 'POST', body: JSON.stringify(staff) });
}
export async function apiUpdateStaff(staff: Staff) {
  return apiFetch<{ staff: Staff }>('/staff', { method: 'PUT', body: JSON.stringify(staff) });
}
export async function apiDeleteStaff(id: string) {
  return apiFetch<{ ok: boolean }>(`/staff?id=${id}`, { method: 'DELETE' });
}

// ── Devices ─────────────────────────────────────────────────
export async function apiGetDevices() { return apiFetch<{ devices: Device[] }>('/devices'); }
export async function apiAddDevice(device: Omit<Device, 'id'>) {
  return apiFetch<{ device: Device }>('/devices', { method: 'POST', body: JSON.stringify(device) });
}
export async function apiUpdateDevice(device: Device) {
  return apiFetch<{ device: Device }>('/devices', { method: 'PUT', body: JSON.stringify(device) });
}
export async function apiDeleteDevice(id: string) {
  return apiFetch<{ ok: boolean }>(`/devices?id=${id}`, { method: 'DELETE' });
}

// ── Attendance ──────────────────────────────────────────────
export async function apiGetAttendance(marketId?: string) {
  const ep = marketId ? `/attendance?market=${encodeURIComponent(marketId)}` : '/attendance';
  return apiFetch<{ attendance: Attendance[] }>(ep);
}

export async function apiClockIn(staffId: string, clockIn: string, device = 'Manual') {
  return apiFetch<{ attendance: Attendance }>('/attendance/clock-in', {
    method: 'POST',
    body: JSON.stringify({ staffId, clockIn, device }),
  });
}

export async function apiClockOut(staffId: string, clockOut: string) {
  return apiFetch<{ attendance: Attendance }>('/attendance/clock-out', {
    method: 'POST',
    body: JSON.stringify({ staffId, clockOut }),
  });
}

export async function apiImportAttendance(records: Partial<Attendance>[]) {
  return apiFetch<{ count: number }>('/attendance/import', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
}

// ── Reports / Payroll ──────────────────────────────────────
export async function apiGetSummary(startDate: string, endDate: string, marketId?: string) {
  const params = new URLSearchParams({ startDate, endDate });
  if (marketId) params.set('market', marketId);
  return apiFetch<{ summary: PayrollRecord[] }>(`/summary?${params}`);
}