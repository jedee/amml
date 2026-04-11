// ─────────────────────────────────────────────────────────────
//  AMML — TypeScript Type Definitions
// ─────────────────────────────────────────────────────────────

// ── Auth ────────────────────────────────────────────────────
export type AuthLevel = 'SUPERADMIN' | 'MD' | 'MANAGER' | 'SUPERVISOR' | 'OFFICER';

export interface User {
  id: string;
  name: string;
  staffId: string;
  authLevel: AuthLevel;
  market: string;
}

export interface NavItem {
  id: string;
  icon: string;
  label: string;
}

export interface RoleConfig {
  label: string;
  short: string;
  color: string;
  level: number;
  nav: NavItem[];
}

// ── Markets ─────────────────────────────────────────────────
export interface Market {
  id: string;
  name: string;
  location: string;
  manager: string;
  capacity: number;
  days: string;
  active: boolean;
  desc: string;
}

// ── Staff ──────────────────────────────────────────────────
export interface Staff {
  id: string;
  first: string;
  last: string;
  dept: string;
  market: string;
  phone: string;
  role: string;
  salary: number;
  active: boolean;
  authLevel: AuthLevel;
  password?: string;
}

// ── Devices ────────────────────────────────────────────────
export type DeviceType =
  | 'Fingerprint Terminal'
  | 'QR Code Scanner'
  | 'RFID Card Reader'
  | 'Face Recognition'
  | 'PIN Pad';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  market: string;
  serial: string;
  location: string;
  active: boolean;
  lastSeen: string;
  clocksToday: number;
}

// ── Attendance ─────────────────────────────────────────────
export interface Attendance {
  id: string;
  staffId: string;
  staffName: string;
  market: string;
  dept: string;
  date: string;        // YYYY-MM-DD
  clockIn: string;     // HH:MM:SS
  clockOut: string;    // HH:MM:SS
  device: string;
  late: boolean;
  duration: number | null; // minutes
}

// ── Reports / Payroll ──────────────────────────────────────
export type FeedFilter = 'all' | 'late' | 'ontime' | 'absent';
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  market: string;
  period: string;
  daysWorked: number;
  basic: number;
  allowances: number;
  deductions: number;
  net: number;
  status: 'pending' | 'approved' | 'paid';
}

// ── Biometric Integration ───────────────────────────────────
export type ZKMapping = Record<string, string>; // ZK-ID → AMML staff ID

export interface ZKImportRow {
  zkId: string;
  date: string;
  time: string;
  inOut: string;
  verify: string;
  ammlId: string | null;
  staffName: string;
}

// ── AI Sales Suite ─────────────────────────────────────────
export interface AILead {
  id: string;
  contact: string;
  company: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  value: number;
  createdAt: string;
  notes: string;
}

// ── Alerts / Activity Log ───────────────────────────────────
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface AlertItem {
  id: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  user: string;
  action: string;
  detail: string;
  timestamp: string;
}

// ── App State ───────────────────────────────────────────────
export interface AppState {
  phase: 'splash' | 'login' | 'app';
  user: User | null;
  marketFilter: string;
  feedF: FeedFilter;
  repType: ReportType;
  mktFilter: string;
  pendXLS: unknown;
  pendSfXLS: unknown;
  // Data collections
  markets: Market[];
  staff: Staff[];
  devices: Device[];
  att: Attendance[];
  users: User[];
  payroll: PayrollRecord[];
  alerts: AlertItem[];
  activityLog: AuditEntry[];
  settings: {
    startTime: string;
    endTime: string;
    lateMinutes: number;
    minHours: number;
    dailyRate: number;
    lateDeduction: number;
    absentDeductPct: number;
  };
  zkMap: ZKMapping;
}
