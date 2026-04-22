import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { usePayroll } from "../../context/PayrollContext";
import { useEmployees } from "../../context/EmployeeContext";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import toast from "react-hot-toast";
import { generatePayslipPDF } from "../../utils/pdfGenerator";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Payroll Report PDF ─────────────────────────────────────────────────────────
async function generatePayrollReportPDF(payroll) {
  const { jsPDF: PDF } = await import("jspdf");
  const doc = new (PDF || jsPDF)({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 14, R = W - 14;

  const C = {
    black: [15, 17, 23], dark: [40, 45, 55], mid: [90, 100, 115],
    light: [160, 168, 180], rule: [220, 224, 230],
    bg: [248, 249, 251], green: [22, 163, 74], greenBg: [240, 253, 244],
    white: [255, 255, 255], accent: [22, 163, 74],
  };

  doc.setFillColor(...C.accent);
  doc.rect(0, 0, W, 1.5, "F");

  doc.setTextColor(...C.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("HSCLogic", L, 18);

  doc.setTextColor(...C.light);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Finance Management System", L, 24);

  doc.setTextColor(...C.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("PAYROLL REPORT", R, 20, { align: "right" });

  doc.setTextColor(...C.mid);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(payroll.period, R, 27, { align: "right" });

  doc.setDrawColor(...C.rule);
  doc.setLineWidth(0.5);
  doc.line(L, 33, R, 33);

  let y = 41;
  const meta = [
    ["Period",           payroll.period],
    ["Employees",        String(payroll.employeeCount)],
    ["Status",           payroll.status],
    ["Processed",        formatDate(payroll.processedDate)],
    ["Total Payout",     formatCurrency(payroll.totalPayout)],
  ];
  meta.forEach(([k, v], i) => {
    const col = i < 3 ? L : W / 2 + 5;
    const row = i < 3 ? i : i - 3;
    const ty  = y + row * 8;
    doc.setTextColor(...C.light);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(k.toUpperCase(), col, ty);
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(v, col, ty + 4.5);
  });

  y += 30;
  doc.setDrawColor(...C.rule);
  doc.setLineWidth(0.3);
  doc.line(L, y, R, y);
  y += 7;

  // Table header
  doc.setFillColor(...C.bg);
  doc.rect(L, y - 1, R - L, 8, "F");
  doc.setTextColor(...C.mid);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("EMPLOYEE", L + 2, y + 4);
  doc.text("BASIC",      108, y + 4, { align: "right" });
  doc.text("ALLOWANCES", 134, y + 4, { align: "right" });
  doc.text("DEDUCTIONS", 160, y + 4, { align: "right" });
  doc.text("NET",        R - 1, y + 4, { align: "right" });
  y += 10;

  payroll.records.forEach((rec, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(252, 253, 254);
      doc.rect(L, y - 1, R - L, 8, "F");
    }
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(rec.employeeName, L + 2, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.mid);
    doc.setFontSize(7.5);
    doc.text(formatCurrency(rec.basic), 108, y + 4, { align: "right" });
    doc.setTextColor([22, 163, 74]);
    doc.text(formatCurrency(rec.allowances), 134, y + 4, { align: "right" });
    doc.setTextColor([220, 38, 38]);
    doc.text(`(${formatCurrency(rec.deductions)})`, 160, y + 4, { align: "right" });
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(rec.net), R - 1, y + 4, { align: "right" });
    y += 8;
  });

  y += 4;
  doc.setFillColor(...C.greenBg);
  doc.rect(L, y, R - L, 10, "F");
  doc.setTextColor(...C.green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL PAYOUT", L + 4, y + 6.5);
  doc.text(formatCurrency(payroll.totalPayout), R - 1, y + 6.5, { align: "right" });

  doc.setDrawColor(...C.rule);
  doc.setLineWidth(0.3);
  doc.line(L, H - 18, R, H - 18);
  doc.setTextColor(...C.light);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("HSCLogic Finance Management System — Payroll Report", L, H - 10);
  doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), R, H - 10, { align: "right" });

  doc.save(`Payroll-${payroll.period.replace(/\s+/g, "-")}.pdf`);
}

// ── Payslip View ───────────────────────────────────────────────────────────────
function PayslipModal({ record, period, onClose }) {
  if (!record) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between p-4 bg-brand-raised rounded border border-brand-border">
        <div>
          <p className="text-brand-sub text-xs mb-1">Payslip — {period}</p>
          <p className="text-brand-text font-bold text-base">{record.employeeName}</p>
          <p className="text-brand-sub text-sm">{record.designation} · {record.department}</p>
        </div>
        <Badge status="Finalized" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-brand-border rounded p-3.5">
          <p className="text-brand-green text-xs font-medium mb-2.5">Earnings</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-sub">Basic Salary</span>
              <span className="text-brand-text tabular-nums">{formatCurrency(record.basic)}</span>
            </div>
            {(record.allowanceDetails ?? []).map((a, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-brand-sub text-xs">{a.name}</span>
                <span className="text-brand-green text-xs tabular-nums">{formatCurrency(a.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-brand-border">
              <span className="text-brand-green font-medium">Gross</span>
              <span className="text-brand-green font-medium tabular-nums">{formatCurrency(record.basic + record.allowances)}</span>
            </div>
          </div>
        </div>
        <div className="border border-brand-border rounded p-3.5">
          <p className="text-brand-red text-xs font-medium mb-2.5">Deductions</p>
          <div className="space-y-1.5 text-sm">
            {(record.deductionDetails ?? []).map((d, i) => (
              <div key={i} className="flex justify-between">
                <span className="text-brand-sub text-xs">{d.name}</span>
                <span className="text-brand-red text-xs tabular-nums">{formatCurrency(d.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-brand-border">
              <span className="text-brand-red font-medium">Total</span>
              <span className="text-brand-red font-medium tabular-nums">{formatCurrency(record.deductions)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-brand-raised border border-brand-border rounded">
        <div>
          <p className="text-brand-sub text-xs mb-0.5">Net Salary</p>
          <p className="text-brand-sub text-xs">After all deductions</p>
        </div>
        <p className="text-brand-green font-bold text-2xl tabular-nums">{formatCurrency(record.net)}</p>
      </div>

      <div className="flex gap-2.5">
        <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">Close</Button>
        <Button variant="primary" size="sm" onClick={() => {
          toast.promise(generatePayslipPDF(record, period), {
            loading: "Generating payslip…", success: "Payslip downloaded!", error: "Failed.",
          });
        }} className="flex-1">
          Download PDF
        </Button>
      </div>
    </div>
  );
}

// ── Payroll Detail ─────────────────────────────────────────────────────────────
function PayrollDetail({ payroll, onFinalize, onClose, isAdmin, currentEmployeeId }) {
  const [viewRecord, setViewRecord] = useState(null);
  if (!payroll) return null;
  const isFinalized = payroll.status === "Finalized";
  const isEmployee  = !!currentEmployeeId;

  // Employees only see their own record; admins/managers see all
  const visibleRecords = isEmployee
    ? payroll.records.filter(r => r.employeeId === currentEmployeeId)
    : payroll.records;

  return (
    <div className="space-y-4">
      {!isEmployee && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Employees", value: payroll.employeeCount },
            { label: "Total Payout", value: formatCurrency(payroll.totalPayout), green: true },
            { label: "Status", badge: payroll.status },
          ].map((s, i) => (
            <div key={i} className="bg-brand-raised rounded border border-brand-border p-3 text-center">
              <p className="text-brand-sub text-xs mb-1">{s.label}</p>
              {s.badge
                ? <div className="flex justify-center"><Badge status={s.badge} /></div>
                : <p className={`font-bold text-base tabular-nums ${s.green ? "text-brand-green" : "text-brand-text"}`}>{s.value}</p>
              }
            </div>
          ))}
        </div>
      )}

      <div className="border border-brand-border rounded overflow-hidden">
        <div className="grid grid-cols-12 gap-0 px-4 py-2 bg-brand-raised text-[10px] text-brand-sub font-medium uppercase tracking-wider border-b border-brand-border">
          <span className="col-span-4">Employee</span>
          <span className="col-span-2 text-right">Basic</span>
          <span className="col-span-2 text-right">Allow.</span>
          <span className="col-span-2 text-right">Deduct.</span>
          <span className="col-span-1 text-right">Net</span>
          <span className="col-span-1" />
        </div>
        {visibleRecords.map(rec => (
          <div key={rec.employeeId} className="grid grid-cols-12 gap-0 px-4 py-2.5 border-b border-brand-border/40 last:border-0 hover:bg-brand-raised/40 transition-colors items-center">
            <div className="col-span-4">
              <p className="text-brand-text text-sm font-medium">{rec.employeeName}</p>
              <p className="text-brand-sub text-xs">{rec.employeeId}</p>
            </div>
            <span className="col-span-2 text-right text-brand-sub text-sm tabular-nums">{formatCurrency(rec.basic)}</span>
            <span className="col-span-2 text-right text-brand-green text-sm tabular-nums">+{formatCurrency(rec.allowances)}</span>
            <span className="col-span-2 text-right text-brand-red text-sm tabular-nums">-{formatCurrency(rec.deductions)}</span>
            <span className="col-span-1 text-right text-brand-text text-sm font-bold tabular-nums">{formatCurrency(rec.net)}</span>
            <div className="col-span-1 flex justify-end">
              <button onClick={() => setViewRecord(rec)}
                className="text-brand-sub text-xs hover:text-brand-text transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 pt-1">
        <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">Close</Button>
        {!isEmployee && (
          <Button variant="ghost" size="sm" onClick={() => {
            toast.promise(generatePayrollReportPDF(payroll), {
              loading: "Generating report…", success: "Report downloaded!", error: "Failed.",
            });
          }}>
            PDF Report
          </Button>
        )}
        {!isFinalized && isAdmin && (
          <Button variant="primary" size="sm" onClick={() => { onFinalize(payroll.id); onClose(); }} className="flex-1">
            Finalize
          </Button>
        )}
        {isFinalized && !isEmployee && (
          <span className="text-brand-green text-sm font-medium">Finalized</span>
        )}
      </div>

      <Modal isOpen={!!viewRecord} onClose={() => setViewRecord(null)} title="Payslip" size="md">
        <PayslipModal record={viewRecord} period={payroll.period} onClose={() => setViewRecord(null)} />
      </Modal>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function PayrollPage() {
  const { payrolls, processPayroll, finalizePayroll, deletePayroll } = usePayroll();
  const { activeEmployees } = useEmployees();
  const { user } = useAuth();
  const isAdmin    = user?.role === "Admin";
  const isEmployee = user?.role === "Employee";

  const now = new Date();
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [selYear, setSelYear]   = useState(now.getFullYear());
  const [viewPayroll, setViewPayroll]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterYear, setFilterYear]     = useState("All");

  const years = useMemo(() => {
    const all = [...new Set(payrolls.map(p => p.year))].sort((a, b) => b - a);
    return all.length ? all : [now.getFullYear()];
  }, [payrolls]);

  const filtered = useMemo(() => {
    if (isEmployee) {
      // Employee sees only finalized payrolls that contain their own record
      return payrolls.filter(p =>
        p.status === "Finalized" &&
        p.records.some(r => r.employeeId === user?.employeeId)
      );
    }
    return payrolls.filter(p => filterYear === "All" || p.year === Number(filterYear));
  }, [payrolls, filterYear, isEmployee, user]);

  const totalPayouts = useMemo(() =>
    payrolls.filter(p => p.status === "Finalized").reduce((s, p) => s + p.totalPayout, 0),
    [payrolls]
  );

  const handleProcess = () => {
    if (!activeEmployees.length) { toast.error("No active employees."); return; }
    const result = processPayroll(selMonth, selYear, activeEmployees);
    if (result.success) toast.success(`Payroll for ${MONTHS[selMonth - 1]} ${selYear} processed.`);
    else toast.error(result.error);
  };

  const handleFinalize = (id) => {
    finalizePayroll(id);
    toast.success("Payroll finalized. Records are now read-only.");
  };

  const handleDelete = () => {
    deletePayroll(deleteTarget.id);
    setDeleteTarget(null);
    toast.success("Payroll record deleted.");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          { label: "Total Records",   value: payrolls.length,                                       cls: "text-brand-text" },
          { label: "Finalized",       value: payrolls.filter(p => p.status === "Finalized").length, cls: "text-[#60a5fa]" },
          { label: "Pending",         value: payrolls.filter(p => p.status === "Pending").length,   cls: "text-[#fbbf24]" },
          { label: "Total Disbursed", value: formatCurrency(totalPayouts),                          cls: "text-brand-green" },
        ].map(s => (
          <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5">
            <p className="text-brand-sub text-xs">{s.label}</p>
            <p className={`font-bold text-lg mt-1 tabular-nums ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Process payroll */}
      {isAdmin && (
        <Card>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-brand-text font-semibold text-sm">Process Monthly Payroll</p>
              <p className="text-brand-sub text-xs mt-0.5">Run payroll for all {activeEmployees.length} active employees.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}
                  className="appearance-none pl-3 pr-7 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 transition-all">
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-sub pointer-events-none" />
              </div>
              <div className="relative">
                <select value={selYear} onChange={e => setSelYear(Number(e.target.value))}
                  className="appearance-none pl-3 pr-7 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 transition-all">
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-sub pointer-events-none" />
              </div>
              <Button variant="primary" size="sm" onClick={handleProcess}>
                Run Payroll
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* History header */}
      <div className="flex items-center justify-between">
        <p className="text-brand-text font-semibold text-sm">Payroll History</p>
        {!isEmployee && (
          <div className="relative">
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 bg-brand-surface border border-brand-border rounded text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 transition-all">
              <option value="All">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-sub pointer-events-none" />
          </div>
        )}
      </div>

      {/* Payroll records */}
      {filtered.length === 0 ? (
        <Card className="py-14 text-center">
          <p className="text-brand-sub text-sm">No payroll records found.</p>
          {isAdmin && <p className="text-brand-sub/50 text-xs mt-1">Use the form above to process payroll.</p>}
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(p => (
            <div key={p.id} className="bg-brand-surface border border-brand-border rounded-xl p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-brand-text font-semibold text-sm">{p.period}</p>
                    <Badge status={p.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-brand-sub">
                    <span>{p.employeeCount} employees</span>
                    <span>{formatDate(p.processedDate)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-brand-sub text-xs">Total Payout</p>
                    <p className="text-brand-text font-bold tabular-nums">{formatCurrency(p.totalPayout)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setViewPayroll(p)}
                      className="text-brand-sub text-xs hover:text-brand-text transition-colors">
                      Details
                    </button>
                    {isAdmin && p.status === "Pending" && (
                      <>
                        <button onClick={() => handleFinalize(p.id)}
                          className="text-brand-sub text-xs hover:text-[#60a5fa] transition-colors">
                          Finalize
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="text-brand-sub text-xs hover:text-brand-red transition-colors">
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Employee preview — admin/manager sees all; employee sees own */}
              {(() => {
                const previewRecs = isEmployee
                  ? p.records.filter(r => r.employeeId === user?.employeeId)
                  : p.records.slice(0, 4);
                return (
                  <div className="mt-3 pt-3 border-t border-brand-border/50 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {previewRecs.map(rec => (
                      <div key={rec.employeeId} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[9px] font-bold bg-brand-raised text-brand-sub">
                          {rec.employeeName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-brand-text text-xs truncate">{rec.employeeName.split(" ")[0]}</p>
                          <p className="text-brand-green text-[10px] tabular-nums">{formatCurrency(rec.net)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!viewPayroll} onClose={() => setViewPayroll(null)}
        title={`Payroll — ${viewPayroll?.period}`} size="xl">
        <PayrollDetail payroll={viewPayroll} onFinalize={handleFinalize}
          onClose={() => setViewPayroll(null)} isAdmin={isAdmin}
          currentEmployeeId={isEmployee ? user?.employeeId : null} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Payroll Record"
        message={`Delete payroll for ${deleteTarget?.period}? This cannot be undone.`}
        confirmLabel="Delete" danger />
    </div>
  );
}
