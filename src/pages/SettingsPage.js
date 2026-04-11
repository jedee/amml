import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// ─────────────────────────────────────────────────────────────
//  AMML — Settings Page
// ─────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Save, Download, Upload } from 'lucide-react';
export default function SettingsPage() {
    const { state, dispatch } = useApp();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({
        startTime: state.settings?.startTime ?? '08:00',
        endTime: state.settings?.endTime ?? '17:00',
        lateMinutes: state.settings?.lateMinutes ?? 15,
        minHours: state.settings?.minHours ?? 7,
        dailyRate: state.settings?.dailyRate ?? 5000,
        lateDeduction: state.settings?.lateDeduction ?? 500,
        absentDeductPct: state.settings?.absentDeductPct ?? 100,
    });
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const save = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: form });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };
    const exportBackup = () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `amml-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    const importBackup = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target?.result);
                dispatch({ type: 'LOAD_STATE', payload: data });
                alert('Backup restored successfully.');
            }
            catch {
                alert('Invalid backup file.');
            }
        };
        reader.readAsText(file);
    };
    const fmt = (n) => `₦${n.toLocaleString()}`;
    return (_jsxs("div", { className: "page active", children: [_jsxs("div", { className: "ph", children: [_jsxs("div", { className: "ph-l", children: [_jsx("h2", { children: "\u2699\uFE0F Settings" }), _jsx("p", { children: "Configure payroll rules, attendance thresholds, and system preferences" })] }), _jsx("div", { className: "ph-r", children: _jsxs("button", { className: "btn btn-blue btn-sm", onClick: save, children: [_jsx(Save, { size: 14 }), " ", saved ? '✓ Saved!' : 'Save Changes'] }) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 20 }, children: [_jsxs("div", { className: "card", children: [_jsx("div", { className: "card-head", children: _jsx("div", { className: "card-title", children: "\uD83D\uDD50 Attendance Rules" }) }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { className: "fg", children: [_jsx("label", { children: "Start Time" }), _jsx("input", { type: "time", value: form.startTime, onChange: e => set('startTime', e.target.value) })] }), _jsxs("div", { className: "fg", children: [_jsx("label", { children: "End Time" }), _jsx("input", { type: "time", value: form.endTime, onChange: e => set('endTime', e.target.value) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { className: "fg", children: [_jsx("label", { children: "Late threshold (minutes)" }), _jsx("input", { type: "number", min: 0, value: form.lateMinutes, onChange: e => set('lateMinutes', Number(e.target.value)) })] }), _jsxs("div", { className: "fg", children: [_jsx("label", { children: "Min hours per day" }), _jsx("input", { type: "number", min: 1, max: 24, value: form.minHours, onChange: e => set('minHours', Number(e.target.value)) })] })] })] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-head", children: _jsx("div", { className: "card-title", children: "\uD83D\uDCB5 Payroll Rules" }) }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { className: "fg", children: [_jsx("label", { children: "Daily rate (\u20A6)" }), _jsx("input", { type: "number", min: 0, value: form.dailyRate, onChange: e => set('dailyRate', Number(e.target.value)) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { className: "fg", children: [_jsx("label", { children: "Late deduction per instance (\u20A6)" }), _jsx("input", { type: "number", min: 0, value: form.lateDeduction, onChange: e => set('lateDeduction', Number(e.target.value)) })] }), _jsxs("div", { className: "fg", children: [_jsx("label", { children: "Absent deduction (% of daily rate)" }), _jsx("input", { type: "number", min: 0, max: 100, value: form.absentDeductPct, onChange: e => set('absentDeductPct', Number(e.target.value)) })] })] })] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-head", children: _jsx("div", { className: "card-title", children: "\uD83D\uDCBE Data Management" }) }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsxs("div", { className: "flex gap-2 flex-wrap", children: [_jsxs("button", { className: "btn btn-outline", onClick: exportBackup, children: [_jsx(Download, { size: 14 }), " Export Backup (JSON)"] }), _jsxs("label", { className: "btn btn-outline", style: { cursor: 'pointer' }, children: [_jsx(Upload, { size: 14 }), " Import Backup", _jsx("input", { type: "file", accept: ".json", style: { display: 'none' }, onChange: importBackup })] })] }), _jsxs("p", { style: { fontSize: 12, color: 'var(--text3)' }, children: [fmt(JSON.stringify(state).length * 2), " chars in memory \u00B7 Exported backup is a full snapshot"] })] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-head", children: _jsx("div", { className: "card-title", children: "\u2139\uFE0F System Info" }) }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }, children: [
                                    ['Markets', state.markets.length],
                                    ['Staff', state.staff.length],
                                    ['Devices', state.devices.length],
                                    ['Attendance Records', state.att.length],
                                    ['Activity Log Entries', state.activityLog.length],
                                    ['Auth Level', state.user?.authLevel ?? '—'],
                                    ['Version', 'AMML v2.0.0'],
                                ].map(([k, v]) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }, children: [_jsx("span", { style: { color: 'var(--text3)' }, children: k }), _jsx("span", { style: { fontWeight: 700, color: 'var(--text)' }, children: v })] }, k))) })] })] })] }));
}
