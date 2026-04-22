import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useInvoices } from "../../context/InvoiceContext";
import { useEmployees } from "../../context/EmployeeContext";
import { usePayroll } from "../../context/PayrollContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { calcInvoiceTotal } from "../../utils/calculations";

const PIE_COLORS = {
  Paid:    "#00cc44",
  Sent:    "#3b82f6",
  Draft:   "#8b8f98",
  Overdue: "#e53935",
};

function StatCard({ label, value, note }) {
  return (
    <Card>
      <p className="text-brand-sub text-xs mb-3">{label}</p>
      <p className="text-brand-text font-bold text-2xl leading-none tabular-nums">{value}</p>
      {note && <p className="text-brand-sub text-xs mt-2">{note}</p>}
    </Card>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-raised border border-brand-border rounded-lg px-3 py-2.5 text-xs shadow-lg">
      <p className="text-brand-sub mb-1.5 font-medium">{label}</p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { invoices }  = useInvoices();
  const { employees } = useEmployees();
  const { payrolls }  = usePayroll();

  const stats = useMemo(() => {
    const paid    = invoices.filter(i => i.status === "Paid").length;
    const pending = invoices.filter(i => i.status === "Sent").length;
    const overdue = invoices.filter(i => i.status === "Overdue").length;
    const revenue = invoices
      .filter(i => i.status === "Paid")
      .reduce((sum, i) => sum + calcInvoiceTotal(i.items), 0);
    const activeEmps = employees.filter(e => e.status === "Active").length;

    const finalizedPayrolls = payrolls.filter(p => p.status === "Finalized");
    const latestFinalized   = finalizedPayrolls[0];
    const totalSalaryPayout = finalizedPayrolls.reduce((s, p) => s + p.totalPayout, 0);
    const employeesPaid     = latestFinalized?.employeeCount ?? 0;
    const pendingPayrolls   = payrolls.filter(p => p.status === "Pending").length;

    return { total: invoices.length, paid, pending, overdue, revenue, activeEmps,
             totalSalaryPayout, employeesPaid, pendingPayrolls };
  }, [invoices, employees, payrolls]);

  // Last 6 months revenue + payroll from live data
  const revenueData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const year  = d.getFullYear();
      const month = d.getMonth(); // 0-indexed

      const revenue = invoices
        .filter(inv => {
          if (inv.status !== "Paid") return false;
          const pd = new Date(inv.issueDate);
          return pd.getFullYear() === year && pd.getMonth() === month;
        })
        .reduce((s, inv) => s + calcInvoiceTotal(inv.items), 0);

      const payroll = payrolls
        .filter(p => p.year === year && p.month === month + 1)
        .reduce((s, p) => s + p.totalPayout, 0);

      return { month: d.toLocaleString("default", { month: "short" }), revenue, payroll };
    });
  }, [invoices, payrolls]);

  const pieData = useMemo(() => {
    const counts = {};
    invoices.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const recentInvoices = invoices.slice(0, 5);
  const latestPayroll  = payrolls[0];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Invoice summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"     value={formatCurrency(stats.revenue)}  note="From paid invoices" />
        <StatCard label="Invoices"          value={stats.total}                    note={`${stats.paid} paid · ${stats.pending} pending`} />
        <StatCard label="Overdue"           value={stats.overdue}                  note={stats.overdue > 0 ? "Requires attention" : "All clear"} />
        <StatCard label="Active Employees"  value={stats.activeEmps}               note={`of ${employees.length} total`} />
      </div>

      {/* Payroll summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Salary Disbursed" value={formatCurrency(stats.totalSalaryPayout)} note="All finalized payrolls" />
        <StatCard label="Employees Paid"         value={stats.employeesPaid}                     note="In latest payroll run" />
        <StatCard label="Pending Payrolls"       value={stats.pendingPayrolls}                   note={stats.pendingPayrolls > 0 ? "Awaiting finalization" : "None pending"} />
        <StatCard label="Payroll Records"        value={payrolls.length}                         note={`${payrolls.filter(p => p.status === "Finalized").length} finalized`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <div className="mb-5">
            <p className="text-brand-text font-semibold text-sm">Revenue vs Payroll</p>
            <p className="text-brand-sub text-xs mt-0.5">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.6} />
              <XAxis dataKey="month" tick={{ fill: "var(--sub)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--sub)", fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={36} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue"
                stroke="#00cc44" strokeWidth={1.5} fill="#00cc44" fillOpacity={0.06} />
              <Area type="monotone" dataKey="payroll" name="Payroll"
                stroke="#3b82f6" strokeWidth={1.5} fill="#3b82f6" fillOpacity={0.06} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <p className="text-brand-text font-semibold text-sm mb-1">Invoice Status</p>
          <p className="text-brand-sub text-xs mb-4">Current distribution</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={65}
                    paddingAngle={3} dataKey="value">
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name] || "#8b8f98"} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v, n]}
                    contentStyle={{
                      background: "var(--raised)", border: "1px solid var(--border)",
                      borderRadius: "6px", fontSize: "11px", color: "var(--text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.map(entry => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[entry.name] || "#8b8f98" }} />
                      <span className="text-brand-sub">{entry.name}</span>
                    </div>
                    <span className="text-brand-text font-medium tabular-nums">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-brand-sub text-sm">No invoices yet.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card padding={false} className="xl:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
            <p className="text-brand-text font-semibold text-sm">Recent Invoices</p>
            <span className="text-brand-sub text-xs">{recentInvoices.length} of {invoices.length}</span>
          </div>
          {recentInvoices.length > 0 ? (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-border">
                  <th className="text-left text-brand-sub font-medium px-5 py-3">Client</th>
                  <th className="text-left text-brand-sub font-medium px-3 py-3 hidden sm:table-cell">Number</th>
                  <th className="text-left text-brand-sub font-medium px-3 py-3 hidden md:table-cell">Due</th>
                  <th className="text-left text-brand-sub font-medium px-3 py-3">Status</th>
                  <th className="text-right text-brand-sub font-medium px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-raised/30 transition-colors">
                    <td className="px-5 py-3 text-brand-text font-medium">{inv.clientName}</td>
                    <td className="px-3 py-3 text-brand-sub hidden sm:table-cell">{inv.invoiceNumber}</td>
                    <td className="px-3 py-3 text-brand-sub hidden md:table-cell">{formatDate(inv.dueDate)}</td>
                    <td className="px-3 py-3"><Badge status={inv.status} /></td>
                    <td className="px-5 py-3 text-right text-brand-text font-medium tabular-nums">
                      {formatCurrency(calcInvoiceTotal(inv.items))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="text-brand-sub text-sm">No invoices yet.</p>
            </div>
          )}
        </Card>

        <Card>
          <p className="text-brand-text font-semibold text-sm mb-1">Latest Payroll</p>
          {latestPayroll ? (
            <>
              <p className="text-brand-sub text-xs mb-4">{latestPayroll.period}</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-sub">Total payout</span>
                  <span className="text-brand-text font-semibold tabular-nums">{formatCurrency(latestPayroll.totalPayout)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-sub">Employees</span>
                  <span className="text-brand-text font-semibold">{latestPayroll.employeeCount}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-brand-sub">Status</span>
                  <Badge status={latestPayroll.status} />
                </div>
              </div>
              <div className="border-t border-brand-border my-4" />
              <p className="text-brand-sub text-xs mb-3">Breakdown</p>
              <div className="space-y-2">
                {latestPayroll.records.map(rec => (
                  <div key={rec.employeeId} className="flex justify-between items-center text-xs">
                    <span className="text-brand-sub truncate">{rec.employeeName.split(" ")[0]}</span>
                    <span className="text-brand-text font-medium tabular-nums">{formatCurrency(rec.net)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="text-brand-sub text-sm">No payroll processed yet.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
