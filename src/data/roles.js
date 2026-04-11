// ─────────────────────────────────────────────────────────────
//  AMML — Role Configuration
// ─────────────────────────────────────────────────────────────
export const ROLE_CONFIG = {
    SUPERADMIN: {
        label: 'Super Admin',
        short: 'SA',
        color: '#4A148C',
        level: 1,
        nav: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'markets', icon: '🏪', label: 'Markets' },
            { id: 'attendance', icon: '🕐', label: 'Attendance' },
            { id: 'staff', icon: '👥', label: 'Staff' },
            { id: 'devices', icon: '📱', label: 'Devices' },
            { id: 'reports', icon: '📋', label: 'Reports' },
            { id: 'payroll', icon: '💵', label: 'Payroll' },
            { id: 'alerts', icon: '🔔', label: 'Alerts' },
            { id: 'activitylog', icon: '📜', label: 'Activity Log' },
            { id: 'users', icon: '👑', label: 'Users' },
            { id: 'ai-sales', icon: '🤖', label: 'AI Sales Suite' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
        ],
    },
    MD: {
        label: 'Managing Director',
        short: 'MD',
        color: '#003C78',
        level: 2,
        nav: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'markets', icon: '🏪', label: 'Markets' },
            { id: 'attendance', icon: '🕐', label: 'Attendance' },
            { id: 'staff', icon: '👥', label: 'Staff' },
            { id: 'devices', icon: '📱', label: 'Devices' },
            { id: 'reports', icon: '📋', label: 'Reports' },
            { id: 'payroll', icon: '💵', label: 'Payroll' },
            { id: 'alerts', icon: '🔔', label: 'Alerts' },
            { id: 'activitylog', icon: '📜', label: 'Activity Log' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
        ],
    },
    MANAGER: {
        label: 'Operations Manager',
        short: 'MGR',
        color: '#0064B4',
        level: 3,
        nav: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'markets', icon: '🏪', label: 'Markets' },
            { id: 'attendance', icon: '🕐', label: 'Attendance' },
            { id: 'staff', icon: '👥', label: 'Staff' },
            { id: 'devices', icon: '📱', label: 'Devices' },
            { id: 'reports', icon: '📋', label: 'Reports' },
            { id: 'alerts', icon: '🔔', label: 'Alerts' },
        ],
    },
    SUPERVISOR: {
        label: 'Market Supervisor',
        short: 'SUP',
        color: '#DC6400',
        level: 4,
        nav: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'attendance', icon: '🕐', label: 'Attendance' },
            { id: 'staff', icon: '👥', label: 'Staff' },
            { id: 'reports', icon: '📋', label: 'Reports' },
            { id: 'alerts', icon: '🔔', label: 'Alerts' },
        ],
    },
    OFFICER: {
        label: 'Market Officer',
        short: 'OFF',
        color: '#288C28',
        level: 5,
        nav: [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'myatt', icon: '🕐', label: 'My Attendance' },
            { id: 'alerts', icon: '🔔', label: 'Notices' },
        ],
    },
};
export const PALETTE = [
    '#0064B4', '#DC6400', '#288C28', '#00508C',
    '#E8821A', '#3A9E4A', '#003C78', '#C85000',
];
export const AUTH_LEVELS = [
    'SUPERADMIN', 'MD', 'MANAGER', 'SUPERVISOR', 'OFFICER',
];
export const LEVEL_LABELS = {
    SUPERADMIN: 'Level 1 — Super Admin',
    MD: 'Level 2 — Managing Director',
    MANAGER: 'Level 3 — Operations Manager',
    SUPERVISOR: 'Level 4 — Market Supervisor',
    OFFICER: 'Level 5 — Market Officer',
};
