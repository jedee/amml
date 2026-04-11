// ─────────────────────────────────────────────────────────────
//  AMML — Attendance Seed Data (30 days)
// ─────────────────────────────────────────────────────────────
function isLate(time, threshold = '08:30') {
    return time > threshold;
}
function calcDur(inTime, outTime) {
    if (!inTime || !outTime)
        return 0;
    const [ih, im] = inTime.split(':').map(Number);
    const [oh, om] = outTime.split(':').map(Number);
    return (oh * 60 + om) - (ih * 60 + im);
}
function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pad(n) {
    return String(n).padStart(2, '0');
}
function rd() {
    const h = rnd(7, 9);
    const m = rnd(0, 59);
    const s = rnd(0, 59);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
function outR() {
    const h = rnd(16, 18);
    const m = rnd(0, 59);
    const s = rnd(0, 59);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
const activeIds = [
    'AMML-001', 'AMML-002', 'AMML-003', 'AMML-004', 'AMML-005',
    'AMML-006', 'AMML-007', 'AMML-008', 'AMML-009', 'AMML-010',
    'AMML-011', 'AMML-012', 'AMML-013', 'AMML-014', 'AMML-015',
    'AMML-016', 'AMML-017', 'AMML-018', 'AMML-019', 'AMML-020',
    'AMML-021', 'AMML-022', 'AMML-023', 'AMML-024',
];
const mktMap = {
    'AMML-001': 'Gudu Market', 'AMML-002': 'Gudu Market',
    'AMML-003': 'Gudu Market', 'AMML-004': 'Wuse Market',
    'AMML-005': 'Wuse Market', 'AMML-006': 'Wuse Market',
    'AMML-007': 'Kado Market', 'AMML-008': 'Kado Market',
    'AMML-009': 'Karimo Market', 'AMML-010': 'Kugbo International Market',
    'AMML-011': 'Area 7/10 Market', 'AMML-012': 'Garki International Market',
    'AMML-013': 'Zone 3 Market', 'AMML-014': 'Apo Zone A, D & E Shopping Complex',
    'AMML-015': 'Area 1 Market', 'AMML-016': 'Nyanya Market',
    'AMML-017': 'Garki Model Market', 'AMML-018': 'Area 2 Market',
    'AMML-019': 'Area 3 Neighbourhood Centre', 'AMML-020': 'Gudu Market',
    'AMML-021': 'Wuse Market', 'AMML-022': 'Kado Market',
    'AMML-023': 'Karimo Market', 'AMML-024': 'Apo Zone A, D & E Shopping Complex',
};
const firstNames = {
    'AMML-001': 'Chibuzor', 'AMML-002': 'Emeka', 'AMML-003': 'Aisha',
    'AMML-004': 'Fatima', 'AMML-005': 'Mohammed', 'AMML-006': 'Hauwa',
    'AMML-007': 'Olumide', 'AMML-008': 'Chidinma', 'AMML-009': 'Khalid',
    'AMML-010': 'Ngozi', 'AMML-011': 'Ebere', 'AMML-012': 'Baba',
    'AMML-013': 'Amina', 'AMML-014': 'Chinedu', 'AMML-015': "Sa'adatu",
    'AMML-016': 'Ebun', 'AMML-017': 'Peace', 'AMML-018': 'Grace',
    'AMML-019': 'Julius', 'AMML-020': 'Halima', 'AMML-021': 'Tolu',
    'AMML-022': 'Daodu', 'AMML-023': 'Ukpabia', 'AMML-024': 'Ngozi',
};
const lastNames = {
    'AMML-001': 'Udekwu', 'AMML-002': 'Nwachukwu', 'AMML-003': 'Yusuf',
    'AMML-004': 'Bello', 'AMML-005': 'Aliyu', 'AMML-006': 'Suleiman',
    'AMML-007': 'Adeyemi', 'AMML-008': 'Okonkwo', 'AMML-009': 'Ibrahim',
    'AMML-010': 'Okereke', 'AMML-011': 'Eze', 'AMML-012': 'Musa',
    'AMML-013': 'Zubairu', 'AMML-014': 'Emeka', 'AMML-015': 'Haruna',
    'AMML-016': 'Obanla', 'AMML-017': 'Okoh', 'AMML-018': 'Mgbii',
    'AMML-019': 'Ogbonna', 'AMML-020': 'Sanusi', 'AMML-021': 'Obi',
    'AMML-022': 'Susan', 'AMML-023': 'Michael', 'AMML-024': 'Okereke',
};
const deptMap = {
    'AMML-001': 'Administration', 'AMML-002': 'Market Operations',
    'AMML-003': 'Finance', 'AMML-004': 'Market Operations',
    'AMML-005': 'Security', 'AMML-006': 'Security',
    'AMML-007': 'Administration', 'AMML-008': 'Finance',
    'AMML-009': 'Market Operations', 'AMML-010': 'Administration',
    'AMML-011': 'Finance', 'AMML-012': 'Administration',
    'AMML-013': 'Finance', 'AMML-014': 'Market Operations',
    'AMML-015': 'Administration', 'AMML-016': 'Market Operations',
    'AMML-017': 'Administration', 'AMML-018': 'Finance',
    'AMML-019': 'Market Operations', 'AMML-020': 'Finance',
    'AMML-021': 'Security', 'AMML-022': 'Administration',
    'AMML-023': 'Security', 'AMML-024': 'Administration',
};
const fmt = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
function generate() {
    const recs = [];
    const today = new Date();
    for (let daysAgo = 30; daysAgo >= 1; daysAgo--) {
        const d = new Date(today);
        d.setDate(d.getDate() - daysAgo);
        if (d.getDay() === 0)
            continue; // skip Sundays
        for (const sid of activeIds) {
            const absent = Math.random() < 0.05;
            if (absent)
                continue;
            const ci = rd();
            const co = outR();
            const late = isLate(ci);
            recs.push({
                id: `a${Math.random().toString(36).slice(2, 9)}`,
                staffId: sid,
                staffName: `${firstNames[sid]} ${lastNames[sid]}`,
                market: mktMap[sid],
                dept: deptMap[sid],
                date: fmt(d),
                clockIn: ci,
                clockOut: co,
                device: 'ZKTeco MB10',
                late,
                duration: calcDur(ci, co),
            });
        }
    }
    return recs;
}
export const SEED_ATTENDANCE = generate();
