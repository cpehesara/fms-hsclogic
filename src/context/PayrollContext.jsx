/**
 * @file PayrollContext.jsx
 * @description Global state and operations for monthly payroll processing.
 *
 * Exposes: payrolls, getPayroll, getPayrollByPeriod, processPayroll,
 *          finalizePayroll, deletePayroll
 *
 * Key invariants enforced here:
 * - Only one payroll record may exist per month/year combination.
 * - Finalized payrolls are permanently read-only; no mutation is permitted
 *   after finalization (enforced at the UI layer via role checks and
 *   confirmed by the status guard on deletePayroll in the UI).
 * - Each payroll record stores a complete salary snapshot at processing
 *   time, decoupled from the live employee salary structures.
 */
import { createContext, useContext, useState } from "react";
import { mockPayroll } from "../data/mockPayroll";
import { calcNetSalary } from "../utils/calculations";

const PayrollContext = createContext(null);

export function PayrollProvider({ children }) {
  const [payrolls, setPayrolls] = useState(mockPayroll);

  const getPayroll = (id) => payrolls.find(p => p.id === id);

  const getPayrollByPeriod = (month, year) =>
    payrolls.find(p => p.month === month && p.year === year);

  const processPayroll = (month, year, activeEmployees) => {
    const existing = getPayrollByPeriod(month, year);
    if (existing) return { success: false, error: "Payroll already processed for this period." };

    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const period = `${monthNames[month - 1]} ${year}`;

    const records = activeEmployees.map(emp => {
      const basic = emp.salary?.basic ?? 0;
      const totalAllowances = (emp.salary?.allowances ?? []).reduce((s, a) => s + (Number(a.amount) || 0), 0);
      const totalDeductions = (emp.salary?.deductions ?? []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
      const net = basic + totalAllowances - totalDeductions;
      return {
        employeeId: emp.id,
        employeeName: emp.fullName,
        designation: emp.designation,
        department: emp.department,
        basic,
        allowances: totalAllowances,
        deductions: totalDeductions,
        net,
        allowanceDetails: emp.salary?.allowances ?? [],
        deductionDetails: emp.salary?.deductions ?? [],
      };
    });

    const totalPayout = records.reduce((s, r) => s + r.net, 0);
    const id = `PAY-${year}-${String(month).padStart(2, "0")}`;

    const newPayroll = {
      id,
      period,
      month,
      year,
      status: "Pending",
      processedDate: new Date().toISOString().split("T")[0],
      totalPayout,
      employeeCount: records.length,
      records,
    };

    setPayrolls(prev => [newPayroll, ...prev]);
    return { success: true, payroll: newPayroll };
  };

  const finalizePayroll = (id) => {
    setPayrolls(prev =>
      prev.map(p => p.id === id ? { ...p, status: "Finalized" } : p)
    );
  };

  const deletePayroll = (id) => {
    setPayrolls(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PayrollContext.Provider value={{
      payrolls,
      getPayroll,
      getPayrollByPeriod,
      processPayroll,
      finalizePayroll,
      deletePayroll,
    }}>
      {children}
    </PayrollContext.Provider>
  );
}

export function usePayroll() {
  const ctx = useContext(PayrollContext);
  if (!ctx) throw new Error("usePayroll must be used inside PayrollProvider");
  return ctx;
}
