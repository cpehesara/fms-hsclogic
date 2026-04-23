/**
 * @file InvoiceContext.jsx
 * @description Global state and CRUD operations for invoices.
 *
 * Exposes: invoices, createInvoice, updateInvoice, deleteInvoice,
 *          updateStatus, getInvoice
 *
 * Overdue detection is handled as derived state via useMemo rather than
 * being stored persistently. On every render, any invoice in "Draft" or
 * "Sent" status whose dueDate is in the past is surfaced as "Overdue"
 * automatically — no scheduled job or manual flag update is needed.
 */
import { createContext, useContext, useState, useMemo } from "react";
import { mockInvoices } from "../data/mockInvoices";
import { calcInvoiceTotal, isOverdue } from "../utils/calculations";

const InvoiceContext = createContext(null);

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState(() =>
    mockInvoices.map(inv => ({
      ...inv,
      total: calcInvoiceTotal(inv.items),
    }))
  );

  // Re-evaluate overdue status on every render so past-due "Sent" invoices surface automatically
  const invoicesWithOverdue = useMemo(() =>
    invoices.map(inv => ({
      ...inv,
      status: isOverdue(inv.dueDate, inv.status) ? "Overdue" : inv.status,
    })),
    [invoices]
  );

  const getNextId = (current) => {
    const nums = current.map(i => parseInt(i.id.replace("INV-", ""), 10)).filter(Boolean);
    const max = nums.length ? Math.max(...nums) : 0;
    return `INV-${String(max + 1).padStart(3, "0")}`;
  };

  const createInvoice = (invoiceData) => {
    const id = getNextId(invoices);
    const newInvoice = {
      ...invoiceData,
      id,
      invoiceNumber: id,
      status: "Draft",
      total: calcInvoiceTotal(invoiceData.items),
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id, invoiceData) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === id
          ? { ...inv, ...invoiceData, total: calcInvoiceTotal(invoiceData.items ?? inv.items) }
          : inv
      )
    );
  };

  const deleteInvoice = (id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const updateStatus = (id, status) => {
    setInvoices(prev =>
      prev.map(inv => inv.id === id ? { ...inv, status } : inv)
    );
  };

  const getInvoice = (id) => invoicesWithOverdue.find(inv => inv.id === id);

  return (
    <InvoiceContext.Provider value={{
      invoices: invoicesWithOverdue,
      createInvoice,
      updateInvoice,
      deleteInvoice,
      updateStatus,
      getInvoice,
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const ctx = useContext(InvoiceContext);
  if (!ctx) throw new Error("useInvoices must be used inside InvoiceProvider");
  return ctx;
}
