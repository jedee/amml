// ─────────────────────────────────────────────────────────────
//  PayrollPilot — Pre-Payroll Validation
//  Validates deductions, PAYE, anomalies before payroll runs
// ─────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { FileCheck, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface PayrollLine {
  staffId: string;
  staffName: string;
  market: string;
  daysWorked: number;
  absentDays: number;
  lateDays: number;
  gross: number;
  tax: number;
  lateDeduction: number;
  absentDeduction: number;
  net: number;
  status: 'clean' | 'warning' | 'critical';
  anomalies: { type: string; severity: string; detail: string }[];
}

function toFullId(id: string): string {
  return id.startsWith('AMML-') ? id : `AMML-${id.padStart(3, '0')}`;
}

function computePAYE(gross: number): number {
  if (gross <= 30000) return gross * 0.07;
  if (gross <= 60000) return gross * 0.11;
  if (gross <= 110000) return gross * 0.15;
  if (gross <= 160000) return gross * 0.19;
  if (gross <= 320000) return gross * 0.21;
  return gross * 0.24;
}

export default function PayrollPilot() {
  const { state } = useApp();
  const { staff, att, settings } = state;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);

  const lines = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return staff.filter(s => s.active).map(s => {
      const normId = toFullId(s.id);
      const sAtt = att.filter(a => toFullId(a.staffId) === normId && a.date <= today);
      const absentDays = Math.max(0, 30 - sAtt.length);
      const lateDays = sAtt.filter(a => a.late).length;
      const lateDeduction = lateDays * (settings.lateDeduction ?? 500);
      const absentDeduction = absentDays * (settings.dailyRate ?? 5000);
      const gross = (settings.dailyRate ?? 5000) * sAtt.length;
      const tax = computePAYE(gross);
      const net = Math.max(0, gross - tax - lateDeduction - absentDeduction);
      const anomalies: PayrollLine['anomalies'] = [];

      if (absentDays > 5) anomalies.push({ type: 'ZERO_CLOCKS', severity: 'warning', detail: `${absentDays} absent days` });
      if (lateDays > 3) anomalies.push({ type: 'EXCESSIVE_LATE', severity: 'warning', detail: `${lateDays} late days` });

      return { staffId: s.id, staffName: `${s.first} ${s.last}`, market: s.market, daysWorked: sAtt.length, absentDays, lateDays, gross, tax, lateDeduction, absentDeduction, net, status: anomalies.length > 0 ? 'warning' : 'clean', anomalies };
    });
  }, [staff, att, settings]);

  const filtered = showOnlyIssues ? lines.filter(l => l.status !== 'clean') : lines;
  const totalGross = filtered.reduce((s, l) => s + l.gross, 0);
  const totalNet = filtered.reduce((s, l) => s + l.net, 0);
  const totalTax = filtered.reduce((s, l) => s + l.tax, 0);
  const issueCount = lines.filter(l => l.status !== 'clean').length;
  const fmt = (n: number) => n.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileCheck size={15} className="text-blue-600" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">PayrollPilot</span>
          <span className="text-xs text-zinc-400">April 2026 · 30 days</span>
        </div>
        <button onClick={() => setShowOnlyIssues(o => !o)} className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors ${showOnlyIssues ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-zinc-50 text-zinc-500 border-zinc-200'}`}>
          {issueCount} issues
        </button>
      </div>

      <div className="grid grid-cols-3 gap-0 rounded-lg border border-zinc-200 overflow-hidden text-xs">
        <div className="px-3 py-2 border-r border-zinc-200 text-center">
          <div className="text-zinc-400 font-semibold uppercase tracking-wide text-[10px]">Gross</div>
          <div className="font-bold text-zinc-800 mt-0.5">{fmt(totalGross)}</div>
        </div>
        <div className="px-3 py-2 border-r border-zinc-200 text-center">
          <div className="text-zinc-400 font-semibold uppercase tracking-wide text-[10px]">PAYE Tax</div>
          <div className="font-bold text-zinc-800 mt-0.5">{fmt(totalTax)}</div>
        </div>
        <div className="px-3 py-2 text-center">
          <div className="text-zinc-400 font-semibold uppercase tracking-wide text-[10px]">Net Pay</div>
          <div className="font-bold text-blue-700 mt-0.5">{fmt(totalNet)}</div>
        </div>
      </div>

      <div className="space-y-1.5">
        {filtered.slice(0, 20).map(line => (
          <div key={line.staffId}>
            <button onClick={() => setExpanded(line.staffId === expanded ? null : line.staffId)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs text-left transition-colors ${line.status === 'clean' ? 'bg-white border-zinc-200 hover:border-zinc-300' : 'bg-amber-50 border-amber-200 hover:border-amber-300'}`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${line.status === 'clean' ? 'bg-green-500' : 'bg-amber-500'}`} />
              <span className="flex-1 font-semibold text-zinc-800">{line.staffName}</span>
              <span className="text-zinc-400 font-mono">{line.daysWorked}d</span>
              {line.lateDays > 0 && <span className="text-amber-600 text-[10px]">{line.lateDays}L</span>}
              {line.absentDays > 0 && <span className="text-red-500 text-[10px]">{line.absentDays}A</span>}
              <span className="font-bold text-blue-700 ml-2">{fmt(line.net)}</span>
              {expanded === line.staffId ? <ChevronUp size={12} className="text-zinc-400 shrink-0" /> : <ChevronDown size={12} className="text-zinc-400 shrink-0" />}
            </button>
            {expanded === line.staffId && (
              <div className="mt-1 px-3 py-2.5 rounded-lg border bg-zinc-50 border-zinc-200 text-xs">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div><span className="text-zinc-400">Gross:</span> <span className="font-semibold font-mono">{fmt(line.gross)}</span></div>
                  <div><span className="text-zinc-400">PAYE:</span> <span className="font-semibold font-mono">{fmt(line.tax)}</span></div>
                  <div><span className="text-zinc-400">Late -{line.lateDays}d:</span> <span className="font-semibold font-mono text-amber-600">{fmt(line.lateDeduction)}</span></div>
                  <div><span className="text-zinc-400">Absent -{line.absentDays}d:</span> <span className="font-semibold font-mono text-red-600">{fmt(line.absentDeduction)}</span></div>
                </div>
                {line.anomalies.length > 0 ? line.anomalies.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-amber-700">
                    <AlertTriangle size={11} className="shrink-0" />
                    <span>{a.detail}</span>
                  </div>
                )) : (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <CheckCircle size={11} />
                    <span>Clean — no anomalies</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
