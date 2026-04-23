import { useState, useMemo } from "react";
import { ChevronDown, Mail, Calendar, Building2 } from "lucide-react";
import { useEmployees } from "../../context/EmployeeContext";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/formatters";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";

const DEPARTMENTS  = ["Engineering", "Design", "Production", "Finance", "Consultancy", "HR", "Operations"];
const DESIGNATIONS = [
  "Senior Software Engineer", "Software Engineer", "UI/UX Designer", "3D Print Technician",
  "Finance Manager", "STEAM Consultant", "HR Manager", "Project Manager", "Intern",
];
const EMPTY_FORM = {
  fullName: "", designation: "", department: "Engineering",
  dateOfJoining: "", email: "", phone: "",
};

const fieldCls = "w-full px-3 py-2 bg-brand-bg border border-brand-border rounded text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green/60 transition-all";

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

// ── Employee Form ──────────────────────────────────────────────────────────────
function EmployeeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(() => initial
    ? { fullName: initial.fullName, designation: initial.designation, department: initial.department,
        dateOfJoining: initial.dateOfJoining, email: initial.email, phone: initial.phone }
    : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())   e.fullName    = "Required.";
    if (!form.designation.trim()) e.designation = "Required.";
    if (!form.department)        e.department   = "Required.";
    if (!form.dateOfJoining)     e.dateOfJoining = "Required.";
    if (!form.email.trim())      e.email = "Required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
    if (!form.phone.trim())      e.phone = "Required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(form); };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Input label="Full Name" required value={form.fullName}
        onChange={e => set("fullName", e.target.value)} error={errors.fullName}
        placeholder="Ashan Perera" />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-brand-sub text-xs font-medium">Designation <span className="text-brand-red">*</span></label>
          <input list="designations" value={form.designation}
            onChange={e => set("designation", e.target.value)}
            placeholder="Software Engineer"
            className={`${fieldCls} ${errors.designation ? "border-brand-red/60" : ""}`} />
          <datalist id="designations">
            {DESIGNATIONS.map(d => <option key={d} value={d} />)}
          </datalist>
          {errors.designation && <p className="text-brand-red text-xs">{errors.designation}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-brand-sub text-xs font-medium">Department <span className="text-brand-red">*</span></label>
          <div className="relative">
            <select value={form.department} onChange={e => set("department", e.target.value)}
              className={`${fieldCls} appearance-none pr-7`}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-sub pointer-events-none" />
          </div>
        </div>
        <Input label="Date of Joining" required type="date" value={form.dateOfJoining}
          onChange={e => set("dateOfJoining", e.target.value)} error={errors.dateOfJoining} />
        <Input label="Phone" required value={form.phone}
          onChange={e => set("phone", e.target.value)} error={errors.phone}
          placeholder="07X XXXXXXX" />
      </div>

      <Input label="Email" required type="email" value={form.email}
        onChange={e => set("email", e.target.value)} error={errors.email}
        placeholder="name@hsclogic.com" />

      <div className="flex justify-end gap-2.5 pt-1">
        <Button variant="secondary" size="sm" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit">
          {initial ? "Save Changes" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}

// ── Employee View ──────────────────────────────────────────────────────────────
function EmployeeView({ employee, onEdit, onClose }) {
  const { calcNetSalary } = useEmployees();
  if (!employee) return null;
  const net            = calcNetSalary(employee.salary);
  const totalAllowances = (employee.salary?.allowances ?? []).reduce((s, a) => s + a.amount, 0);
  const totalDeductions = (employee.salary?.deductions ?? []).reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3.5 p-4 bg-brand-raised rounded border border-brand-border">
        <div className={`w-11 h-11 rounded flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          employee.status === "Active" ? "bg-brand-green/15 text-brand-green" : "bg-brand-raised text-brand-sub"
        }`}>
          {getInitials(employee.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-brand-text font-bold text-base leading-tight">{employee.fullName}</p>
          <p className="text-brand-sub text-sm">{employee.designation}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge status={employee.status} />
            <span className="text-brand-sub text-xs font-mono">{employee.id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 text-sm">
        {[
          { icon: Building2, label: "Department",     value: employee.department },
          { icon: Calendar,  label: "Date of Joining", value: formatDate(employee.dateOfJoining) },
          { icon: Mail,      label: "Email",           value: employee.email },
          { icon: Mail,      label: "Phone",           value: employee.phone },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-brand-raised rounded p-3 border border-brand-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon size={12} className="text-brand-sub" />
              <p className="text-brand-sub text-xs">{label}</p>
            </div>
            <p className="text-brand-text text-sm font-medium break-all">{value}</p>
          </div>
        ))}
      </div>

      {employee.salary && (
        <div className="bg-brand-raised rounded p-4 border border-brand-border">
          <p className="text-brand-sub text-xs font-medium mb-3">Salary Summary</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-brand-sub">Basic Salary</span>
              <span className="text-brand-text tabular-nums">LKR {employee.salary.basic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-green">+ Allowances</span>
              <span className="text-brand-green tabular-nums">LKR {totalAllowances.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-red">− Deductions</span>
              <span className="text-brand-red tabular-nums">LKR {totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-brand-border">
              <span className="text-brand-text font-semibold">Net Salary</span>
              <span className="text-brand-green font-bold tabular-nums">LKR {net.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        <Button variant="secondary" size="sm" onClick={onClose} className="flex-1">Close</Button>
        {onEdit && (
          <Button variant="primary" size="sm" onClick={() => onEdit(employee)} className="flex-1">
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

// ── CSV Export ─────────────────────────────────────────────────────────────────
function exportCSV(employees) {
  const headers = ["ID", "Full Name", "Designation", "Department", "Date of Joining", "Email", "Phone", "Status"];
  const rows = employees.map(e => [
    e.id, e.fullName, e.designation, e.department, e.dateOfJoining, e.email, e.phone, e.status,
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deactivateEmployee, activateEmployee } = useEmployees();
  const { can } = useAuth();
  const isAdmin = can("manage_employees");

  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [view, setView]                 = useState("table"); // "table" | "grid"
  const [showAdd, setShowAdd]           = useState(false);
  const [editEmp, setEditEmp]           = useState(null);
  const [viewEmp, setViewEmp]           = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const filtered = useMemo(() =>
    employees.filter(emp => {
      const q = search.toLowerCase();
      const matchQ = !q || emp.fullName.toLowerCase().includes(q) || emp.id.toLowerCase().includes(q) || emp.designation.toLowerCase().includes(q);
      const matchS = filterStatus === "All" || emp.status === filterStatus;
      return matchQ && matchS;
    }),
    [employees, search, filterStatus]
  );

  const stats = useMemo(() => ({
    total:    employees.length,
    active:   employees.filter(e => e.status === "Active").length,
    inactive: employees.filter(e => e.status === "Inactive").length,
  }), [employees]);

  const handleAdd    = (data) => { addEmployee(data);                        setShowAdd(false); toast.success("Employee added."); };
  const handleEdit   = (data) => { updateEmployee(editEmp.id, data);         setEditEmp(null);  toast.success("Employee updated."); };
  const handleToggle = () => {
    if (toggleTarget.status === "Active") { deactivateEmployee(toggleTarget.id); toast.success(`${toggleTarget.fullName} deactivated.`); }
    else                                  { activateEmployee(toggleTarget.id);   toast.success(`${toggleTarget.fullName} activated.`); }
    setToggleTarget(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
        {[
          { label: "Total",    value: stats.total,    cls: "text-brand-text" },
          { label: "Active",   value: stats.active,   cls: "text-brand-green" },
          { label: "Inactive", value: stats.inactive, cls: "text-brand-sub" },
        ].map(s => (
          <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3.5 flex items-center justify-between">
            <span className="text-brand-sub text-xs">{s.label}</span>
            <span className={`font-bold text-xl tabular-nums ${s.cls}`}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, or designation…"
          className="w-full px-3.5 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text text-sm placeholder:text-brand-sub/40 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[100px]">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-colors">
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-sub pointer-events-none" />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView(v => v === "table" ? "grid" : "table")}>
            {view === "table" ? "Grid" : "Table"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { exportCSV(filtered); toast.success("CSV exported."); }}>
            CSV
          </Button>
          {isAdmin && (
            <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
              Add
            </Button>
          )}
        </div>
      </div>

      {/* Table view */}
      {view === "table" && (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-brand-border bg-brand-raised/60">
                  <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Employee</th>
                  <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden sm:table-cell">Department</th>
                  <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden md:table-cell">Designation</th>
                  <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden lg:table-cell">Email</th>
                  <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden md:table-cell">Joined</th>
                  <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Status</th>
                  <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-brand-sub text-sm">
                        {search || filterStatus !== "All" ? "No employees match your filters." : "No employees yet."}
                      </p>
                    </td>
                  </tr>
                ) : filtered.map(emp => (
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
                          <p className="text-brand-sub text-xs font-mono">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-sub text-sm hidden sm:table-cell">{emp.department}</td>
                    <td className="px-4 py-3 text-brand-sub text-sm hidden md:table-cell">{emp.designation}</td>
                    <td className="px-4 py-3 text-brand-sub text-sm hidden lg:table-cell">{emp.email}</td>
                    <td className="px-4 py-3 text-brand-sub text-sm whitespace-nowrap hidden md:table-cell">{formatDate(emp.dateOfJoining)}</td>
                    <td className="px-4 py-3"><Badge status={emp.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewEmp(emp)}
                          className="text-brand-sub text-xs hover:text-brand-text transition-colors whitespace-nowrap">
                          View
                        </button>
                        {isAdmin && (
                          <button onClick={() => setEditEmp(emp)}
                            className="text-brand-sub text-xs hover:text-brand-green transition-colors hidden sm:inline whitespace-nowrap">
                            Edit
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => setToggleTarget(emp)}
                            className={`text-xs transition-colors hidden sm:inline whitespace-nowrap ${
                              emp.status === "Active"
                                ? "text-brand-sub hover:text-brand-red"
                                : "text-brand-sub hover:text-brand-green"
                            }`}>
                            {emp.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-brand-border text-xs text-brand-sub">
              {filtered.length} of {employees.length} employees
            </div>
          )}
        </Card>
      )}

      {/* Grid view */}
      {view === "grid" && (
        filtered.length === 0 ? (
          <Card className="py-14 text-center">
            <p className="text-brand-sub text-sm">No employees match your filters.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(emp => (
              <div key={emp.id}
                className="bg-brand-surface border border-brand-border rounded-lg p-4 hover:border-brand-border/80 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-9 h-9 rounded flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                    emp.status === "Active" ? "bg-brand-green/15 text-brand-green" : "bg-brand-raised text-brand-sub"
                  }`}>
                    {getInitials(emp.fullName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-text font-semibold text-sm leading-tight truncate">{emp.fullName}</p>
                    <p className="text-brand-sub text-xs mt-0.5 truncate">{emp.designation}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge status={emp.status} />
                      <span className="text-brand-sub text-[10px] font-mono">{emp.id}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-brand-sub">
                    <Building2 size={11} /> <span className="truncate">{emp.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-sub">
                    <Mail size={11} /> <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-brand-sub">
                    <Calendar size={11} /> <span>Joined {formatDate(emp.dateOfJoining)}</span>
                  </div>
                </div>
                <div className="flex gap-1.5 pt-3 border-t border-brand-border">
                  <button onClick={() => setViewEmp(emp)}
                    className="flex-1 py-1.5 rounded text-xs text-brand-sub hover:text-brand-text hover:bg-brand-raised transition-colors">
                    View
                  </button>
                  {isAdmin && (
                    <button onClick={() => setEditEmp(emp)}
                      className="flex-1 py-1.5 rounded text-xs text-brand-sub hover:text-brand-green hover:bg-brand-green/10 transition-colors">
                      Edit
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setToggleTarget(emp)}
                      className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                        emp.status === "Active"
                          ? "text-brand-sub hover:text-brand-red hover:bg-brand-red/10"
                          : "text-brand-sub hover:text-brand-green hover:bg-brand-green/10"
                      }`}>
                      {emp.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {isAdmin && (
        <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Employee" size="md">
          <EmployeeForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
      {isAdmin && (
        <Modal isOpen={!!editEmp} onClose={() => setEditEmp(null)} title="Edit Employee" size="md">
          <EmployeeForm initial={editEmp} onSave={handleEdit} onCancel={() => setEditEmp(null)} />
        </Modal>
      )}
      <Modal isOpen={!!viewEmp} onClose={() => setViewEmp(null)} title="Employee Profile" size="md">
        <EmployeeView employee={viewEmp} onEdit={isAdmin ? (e) => { setViewEmp(null); setEditEmp(e); } : null} onClose={() => setViewEmp(null)} />
      </Modal>
      {isAdmin && (
        <ConfirmDialog
          isOpen={!!toggleTarget} onClose={() => setToggleTarget(null)} onConfirm={handleToggle}
          title={toggleTarget?.status === "Active" ? "Deactivate Employee" : "Activate Employee"}
          message={`${toggleTarget?.status === "Active" ? "Deactivate" : "Activate"} ${toggleTarget?.fullName}?`}
          confirmLabel={toggleTarget?.status === "Active" ? "Deactivate" : "Activate"}
          danger={toggleTarget?.status === "Active"}
        />
      )}
    </div>
  );
}
