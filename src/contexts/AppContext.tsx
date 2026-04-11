// ─────────────────────────────────────────────────────────────
//  AMML — Application State Context
//  Replaces the vanilla JS global S = { ... } object
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type {
  AppState,
  AuthLevel,
  NavItem,
  User,
  Market,
  Staff,
  Device,
  Attendance,
  FeedFilter,
  ReportType,
  AuditEntry,
  AlertItem,
  PayrollRecord,
  ZKMapping,
  RoleConfig,
} from '../types/models';
import { MARKETS } from '../data/markets';
import { STAFF } from '../data/staff';
import { DEVICES } from '../data/devices';
import { ROLE_CONFIG } from '../data/roles';
import { SEED_ATTENDANCE } from '../data/attendance';

// ── Initial State ───────────────────────────────────────────

const initialState: AppState = {
  user: null,
  phase: 'splash' as const,
  marketFilter: 'All Markets',
  feedF: 'all',
  repType: 'monthly' as ReportType,
  mktFilter: '',
  pendXLS: null,
  pendSfXLS: null,
  markets: [...MARKETS],
  staff: [...STAFF],
  devices: [...DEVICES],
  att: SEED_ATTENDANCE,
  users: [],
  payroll: [],
  alerts: [],
  activityLog: [],
  zkMap: {},
};

// ── Actions ──────────────────────────────────────────────────

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_PASSWORD'; payload: { staffId: string; password: string } }
  | { type: 'SET_MARKET_FILTER'; payload: string }
  | { type: 'SET_FEED_FILTER'; payload: FeedFilter }
  | { type: 'SET_REP_TYPE'; payload: ReportType }
  | { type: 'SET_MKT_FILTER'; payload: string }
  | { type: 'ADD_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF'; payload: Staff }
  | { type: 'UPDATE_STAFF_AUTH'; payload: { staffId: string; authLevel: AuthLevel } }
  | { type: 'DELETE_STAFF'; payload: string }
  | { type: 'ADD_DEVICE'; payload: Device }
  | { type: 'UPDATE_DEVICE'; payload: Device }
  | { type: 'DELETE_DEVICE'; payload: string }
  | { type: 'ADD_ATTENDANCE'; payload: Attendance }
  | { type: 'BULK_IMPORT_ATT'; payload: Attendance[] }
  | { type: 'UPDATE_ATT'; payload: Attendance }
  | { type: 'DELETE_ATT'; payload: string }
  | { type: 'CLOCK_IN'; payload: { staffId: string; clockIn: string } }
  | { type: 'CLOCK_OUT'; payload: { staffId: string; clockOut: string } }
  | { type: 'ADD_MARKET'; payload: Market }
  | { type: 'UPDATE_MARKET'; payload: Market }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_PAYROLL'; payload: PayrollRecord }
  | { type: 'ADD_ALERT'; payload: AlertItem }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'AUDIT_LOG'; payload: { action: string; detail: string } }
  | { type: 'SET_ZK_MAP'; payload: ZKMapping }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

// ── Reducer ─────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, phase: 'app' as const };
    case 'LOGOUT':
      return { ...state, user: null, phase: 'login' };

    case 'SET_MARKET_FILTER':
      return { ...state, marketFilter: action.payload };
    case 'SET_FEED_FILTER':
      return { ...state, feedF: action.payload };
    case 'SET_REP_TYPE':
      return { ...state, repType: action.payload };
    case 'SET_PASSWORD':
      return {
        ...state,
        staff: state.staff.map(s =>
          s.id === action.payload.staffId
            ? { ...s, password: action.payload.password }
            : s
        ),
      };

    case 'SET_MKT_FILTER':
      return { ...state, mktFilter: action.payload };

    case 'ADD_STAFF':
      return { ...state, staff: [...state.staff, action.payload] };
    case 'UPDATE_STAFF':
      return {
        ...state,
        staff: state.staff.map(s => s.id === action.payload.id ? action.payload : s),
      };

    case 'UPDATE_STAFF_AUTH':
      return {
        ...state,
        staff: state.staff.map(s =>
          s.id === action.payload.staffId
            ? { ...s, authLevel: action.payload.authLevel }
            : s
        ),
      };
    case 'DELETE_STAFF':
      return { ...state, staff: state.staff.filter(s => s.id !== action.payload) };

    case 'ADD_DEVICE':
      return { ...state, devices: [...state.devices, action.payload] };
    case 'UPDATE_DEVICE':
      return {
        ...state,
        devices: state.devices.map(d => d.id === action.payload.id ? action.payload : d),
      };
    case 'DELETE_DEVICE':
      return { ...state, devices: state.devices.filter(d => d.id !== action.payload) };

    case 'ADD_ATTENDANCE':
      return { ...state, att: [...state.att, action.payload] };
    case 'BULK_IMPORT_ATT':
      return { ...state, att: [...state.att, ...action.payload] };
    case 'UPDATE_ATT':
      return {
        ...state,
        att: state.att.map(a => a.id === action.payload.id ? action.payload : a),
      };
    case 'DELETE_ATT':
      return { ...state, att: state.att.filter(a => a.id !== action.payload) };

    case 'CLOCK_IN': {
      const { staffId, clockIn } = action.payload;
      const sf = state.staff.find(s => s.id === staffId);
      if (!sf) return state;
      const today = new Date().toISOString().split('T')[0];
      const exists = state.att.find(a => a.staffId === staffId && a.date === today);
      if (exists) return state;
      const [h, m] = clockIn.split(':').map(Number);
      const late = h * 60 + m > 8 * 60 + 30;
      const entry: Attendance = {
        id: `a${Math.random().toString(36).slice(2, 9)}`,
        staffId,
        staffName: `${sf.first} ${sf.last}`,
        market: sf.market,
        dept: sf.dept,
        date: today,
        clockIn,
        clockOut: '',
        device: 'Manual',
        late,
        duration: null,
      };
      return { ...state, att: [...state.att, entry] };
    }

    case 'CLOCK_OUT': {
      const { staffId, clockOut } = action.payload;
      const today = new Date().toISOString().split('T')[0];
      const rec = state.att.find(a => a.staffId === staffId && a.date === today && !a.clockOut);
      if (!rec) return state;
      const [ih, im] = rec.clockIn.split(':').map(Number);
      const [oh, om] = clockOut.split(':').map(Number);
      const duration = (oh * 60 + om) - (ih * 60 + im);
      const updated = { ...rec, clockOut, duration };
      return {
        ...state,
        att: state.att.map(a => a.id === rec.id ? updated : a),
      };
    }

    case 'ADD_MARKET':
      return { ...state, markets: [...state.markets, action.payload] };
    case 'UPDATE_MARKET':
      return {
        ...state,
        markets: state.markets.map(m => m.id === action.payload.id ? action.payload : m),
      };

    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u),
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(u => u.id !== action.payload) };

    case 'ADD_PAYROLL':
      return { ...state, payroll: [...state.payroll, action.payload] };

    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'DISMISS_ALERT':
      return { ...state, alerts: state.alerts.filter(a => a.id !== action.payload) };

    case 'AUDIT_LOG': {
      const entry: AuditEntry = {
        id: `log${Date.now()}`,
        user: state.user?.name ?? 'System',
        action: action.payload.action,
        detail: action.payload.detail,
        timestamp: new Date().toISOString(),
      };
      return { ...state, activityLog: [entry, ...state.activityLog] };
    }

    case 'SET_ZK_MAP':
      return { ...state, zkMap: action.payload };

    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  navItems: NavItem[];
  roleConfig: RoleConfig | undefined;
  authLevels: AuthLevel[];
  levelLabels: Record<AuthLevel, string>;
  isLoggedIn: boolean;
  can: (minLevel: number) => boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────

interface Props { children: ReactNode }

export function AppProvider({ children }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const navItems = state.user
    ? (ROLE_CONFIG[state.user.authLevel]?.nav ?? [])
    : [];

  const roleConfig: RoleConfig | undefined = state.user ? ROLE_CONFIG[state.user.authLevel] : undefined;
  const authLevels: AuthLevel[] = ['SUPERADMIN', 'MD', 'MANAGER', 'SUPERVISOR', 'OFFICER'];
  const levelLabels: Record<AuthLevel, string> = {
    SUPERADMIN: 'Level 1 — Super Admin',
    MD: 'Level 2 — Managing Director',
    MANAGER: 'Level 3 — Operations Manager',
    SUPERVISOR: 'Level 4 — Market Supervisor',
    OFFICER: 'Level 5 — Market Officer',
  };

  const isLoggedIn = state.user !== null;

  const can = (minLevel: number): boolean => {
    if (!state.user) return false;
    const userLevel = ROLE_CONFIG[state.user.authLevel]?.level ?? 99;
    return userLevel <= minLevel;
  };

  // Persist entire state to localStorage (except noisy computed fields)
  useEffect(() => {
    try {
      localStorage.setItem('amml_state', JSON.stringify(state));
    } catch { /* ignore */ }
  }, [state]);

  // Restore full state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('amml_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) {
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        }
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, navItems, roleConfig, authLevels, levelLabels, isLoggedIn, can }}>
      {children}
    </AppContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
