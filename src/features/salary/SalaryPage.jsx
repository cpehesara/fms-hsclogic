import { useState, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { useEmployees } from "../../context/EmployeeContext";
import { formatCurrency } from "../../utils/formatters";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { generateSalaryReportPDF } from "../../utils/pdfGenerator";

const fieldCls = "w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm focus:outline-none focus:ring-1 focus:ring-brand-green/40 transition-all";

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

// ── Salary Structure Editor ────────────────────────────────────────────────────
function SalaryEditor({ employee, onSave, onCancel }) {
  const [basic, setBasic] = useState(employee.salary?.basic ?? 0);
  const [allowances, setAllowances] = useState(
    employee.salary?.allowances?.length
      ? employee.salary.allowances.map((a, i) => ({ ...a, id: i }))
      : [{ id: 0, name: "Transport Allowance", amount: 0 }]
  );
  const [deductions, setDeductions] = useState(
    employee.salary?.deductions?.length
      ? employee.salary.deductions.map((d, i) => ({ ...d, id: i }))
      : [{ id: 0, name: "EPF (8%)", amount: 0 }]
  );

  const totalAllowances = allowances.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const totalDeductions = deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const netSalary = (Number(basic) || 0) + totalAllowances - totalDeductions;

  const addA = () => setAllowances(a => [...a, { id: Date.now(), name: "", amount: 0 }]);
  const remA = (id) => setAllowances(a => a.filter(x => x.id !== id));
  const setA = (id, k, v) => setAllowances(a => a.map(x => x.id === id ? { ...x, [k]: v } : x));

  const addD = () => setDeductions(d => [...d, { id: Date.now(), name: "", amount: 0 }]);
  const remD = (id) => setDeductions(d => d.filter(x => x.id !== id));
  const setD = (id, k, v) => setDeductions(d => d.map(x => x.id === id ? { ...x, [k]: v } : x));

  const handleSave = () => {
    if (!basic || Number(basic) <= 0) { toast.error("Basic salary must be > 0."); return; }
    onSave({
      basic: Number(basic),
      allowances: allowances.map(({ id: _, ...r }) => ({ ...r, amount: Number(r.amount) || 0 })),
      deductions: deductions.map(({ id: _, ...r }) => ({ ...r, amount: Number(r.amount) || 0 })),
    });
  };

  const ComponentRows = ({ items, onAdd, onRemove, onChange, addLabel, colorCls }) => (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.id} className="flex gap-2 items-center">
          <input value={item.name} onChange={e => onChange(item.id, "name", e.target.value)}
            placeholder="Component name" className={`flex-1 ${fieldCls}`} />
          <input type="number" min="0" step="0.01" value={item.amount}
            onChange={e => onChange(item.id, "amount", e.target.value)}
            className={`w-28 ${fieldCls} text-right`} />
          {items.length > 1 && (
            <button type="button" onClick={() => onRemove(item.id)}
              className="text-brand-sub hover:text-brand-red transition-colors flex-shrink-0">
              <X size={13} />
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={onAdd}
        className={`text-xs font-medium flex items-center gap-1 transition-colors ${colorCls}`}>
        <Plus size={11} /> {addLabel}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-brand-raised rounded border border-brand-border">
        <div className="w-8 h-8 rounded bg-brand-green/15 flex items-center justify-center flex-shrink-0">
          <span className="text-brand-green font-bold text-xs">{getInitials(employee.fullName)}</span>
        </div>
        <div>
          <p className="text-brand-text font-semibold text-sm">{employee.fullName}</p>
          <p className="text-brand-sub text-xs">{employee.designation} · {employee.department}</p>
        </div>
      </div>

      <Input label="Basic Salary (LKR)" required type="number" min="0"
        value={basic} onChange={e => setBasic(e.target.value)} prefix="LKR" inputClassName="pl-12" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-brand-green text-xs font-medium">Allowances</span>
          <span className="text-brand-green text-xs font-mono">+{formatCurrency(totalAllowances)}</span>
        </div>
        <ComponentRows items={allowances} onAdd={addA} onRemove={remA} onChange={setA}
          addLabel="Add Allowance" colorCls="text-brand-green hover:text-[#4ade80]" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-brand-red text-xs font-medium">Deductions</span>
          <span className="text-brand-red text-xs font-mono">-{formatCurrency(totalDeductions)}</span>
        </div>
        <ComponentRows items={deductions} onAdd={addD} onRemove={remD} onChange={setD}
          addLabel="Add Deduction" colorCls="text-brand-red hover:text-[#fca5a5]" />
      </div>

      <div className="flex items-center justify-between p-3.5 bg-brand-raised border border-brand-border rounded">
        <div>
          <p className="text-brand-sub text-xs mb-0.5">Net Salary</p>
          <p className="text-brand-sub text-xs">Basic + Allowances − Deductions</p>
        </div>
        <p className="text-brand-green font-bold text-xl tabular-nums">{formatCurrency(netSalary)}</p>
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          Save Structure
        </Button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SalaryPage() {
  const { employees, updateSalary, calcNetSalary } = useEmployees();
  const [search, setSearch]     = useState("");
  const [editTarget, setEditTarget] = useState(null);

  const filtered = useMemo(() =>
    employees.filter(emp => {
      const q = search.toLowerCase();
      return !q || emp.fullName.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q) || emp.designation.toLowerCase().includes(q);
    }),
    [employees, search]
  );

  const activeEmps = useMemo(() => employees.filter(e => e.status === "Active"), [employees]);

  const totalPayroll = useMemo(() =>
    activeEmps.reduce((s, e) => s + calcNetSalary(e.salary), 0),
    [activeEmps, calcNetSalary]
  );

  const avgNet = activeEmps.length ? totalPayroll / activeEmps.length : 0;

  const handleSave = (salary) => {
    updateSalary(editTarget.id, salary);
    setEditTarget(null);
    toast.success(`Salary updated for ${editTarget.fullName}.`);
  };

  const handleExportReport = () => {
    toast.promise(generateSalaryReportPDF(employees, calcNetSalary), {
      loading: "Generating report…", success: "Salary report exported!", error: "Export failed.",
    });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5">
          <p className="text-brand-sub text-xs">Monthly Payroll</p>
          <p className="text-brand-text font-bold text-lg tabular-nums mt-1">{formatCurrency(totalPayroll)}</p>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5">
          <p className="text-brand-sub text-xs">Active Employees</p>
          <p className="text-brand-text font-bold text-lg mt-1">{activeEmps.length}</p>
        </div>
        <div className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5">
          <p className="text-brand-sub text-xs">Avg. Net Salary</p>
          <p className="text-brand-text font-bold text-lg tabular-nums mt-1">{formatCurrency(avgNet)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2.5">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, department, or designation…"
          className="flex-1 px-3.5 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text text-sm placeholder:text-brand-sub/40 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-colors" />
        <Button variant="ghost" size="sm" onClick={handleExportReport}>
          Export
        </Button>
      </div>

      {/* Salary table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-brand-border bg-brand-raised/60">
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Employee</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden sm:table-cell">Department</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden sm:table-cell">Basic</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden md:table-cell">Allow.</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden md:table-cell">Deduct.</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Net Salary</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden sm:table-cell">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-brand-sub text-sm">No employees match your search.</td>
                </tr>
              ) : filtered.map(emp => {
                const totalA = (emp.salary?.allowances ?? []).reduce((s, a) => s + (Number(a.amount) || 0), 0);
                const totalD = (emp.salary?.deductions ?? []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
                const net    = calcNetSalary(emp.salary);
                return (
                  <tr key={emp.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-raised/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                          emp.status === "Active" ? "bg-brand-green/15 text-brand-green" : "bg-brand-raised text-brand-sub"
                        }`}>
                          {getInitials(emp.fullName)}
                        </div>
                        <div>
                          <p className="text-brand-text text-sm font-medium">{emp.fullName}</p>
                          <p className="text-brand-sub text-xs">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-sub text-sm hidden sm:table-cell">{emp.department}</td>
                    <td className="px-4 py-3 text-brand-text text-sm tabular-nums hidden sm:table-cell">{formatCurrency(emp.salary?.basic ?? 0)}</td>
                    <td className="px-4 py-3 text-brand-green text-sm tabular-nums hidden md:table-cell">+{formatCurrency(totalA)}</td>
                    <td className="px-4 py-3 text-brand-red text-sm tabular-nums hidden md:table-cell">-{formatCurrency(totalD)}</td>
                    <td className="px-4 py-3 text-brand-text text-sm font-bold tabular-nums whitespace-nowrap">{formatCurrency(net)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Badge status={emp.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditTarget(emp)}
                        className="text-brand-sub text-xs hover:text-brand-green transition-colors whitespace-nowrap">
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active employee detail cards */}
      {filtered.filter(e => e.status === "Active").length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {filtered.filter(e => e.status === "Active").map(emp => {
            const net = calcNetSalary(emp.salary);
            return (
              <Card key={emp.id}>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-brand-green/15 flex items-center justify-center text-brand-green text-xs font-bold">
                      {getInitials(emp.fullName)}
                    </div>
                    <div>
                      <p className="text-brand-text text-sm font-semibold">{emp.fullName}</p>
                      <p className="text-brand-sub text-xs">{emp.id}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditTarget(emp)}
                    className="text-brand-sub text-xs hover:text-brand-green transition-colors">
                    Edit
                  </button>
                </div>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-brand-border/50">
                    <span className="text-brand-sub">Basic</span>
                    <span className="text-brand-text tabular-nums">{formatCurrency(emp.salary?.basic ?? 0)}</span>
                  </div>
                  {(emp.salary?.allowances ?? []).map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-brand-sub text-xs">+ {a.name}</span>
                      <span className="text-brand-green text-xs tabular-nums">{formatCurrency(a.amount)}</span>
                    </div>
                  ))}
                  {(emp.salary?.deductions ?? []).map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-brand-sub text-xs">− {d.name}</span>
                      <span className="text-brand-red text-xs tabular-nums">{formatCurrency(d.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-brand-border">
                    <span className="text-brand-text font-semibold text-sm">Net Salary</span>
                    <span className="text-brand-green font-bold tabular-nums">{formatCurrency(net)}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Salary Structure" size="md">
        {editTarget && (
          <SalaryEditor employee={editTarget} onSave={handleSave} onCancel={() => setEditTarget(null)} />
        )}
      </Modal>
    </div>
  );
}
