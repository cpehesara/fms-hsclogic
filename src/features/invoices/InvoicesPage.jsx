import { useState, useMemo } from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import { useInvoices } from "../../context/InvoiceContext";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { calcLineTotal, calcInvoiceTotal } from "../../utils/calculations";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Input from "../../components/ui/Input";
import toast from "react-hot-toast";
import { generateInvoicePDF } from "../../utils/pdfGenerator";

const SERVICE_TYPES = ["Software", "3D Printing", "Others"];
const STATUSES = ["Draft", "Sent", "Paid", "Overdue"];

const fieldCls = "w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-md text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-colors";

// ── InvoiceForm ────────────────────────────────────────────────────────────────
function InvoiceForm({ initial, onSave, onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(() =>
    initial
      ? { ...initial, items: initial.items.map(it => ({ ...it })) }
      : {
          clientName: "", serviceType: "Software",
          issueDate: today, dueDate: "", notes: "",
          items: [{ id: 1, description: "", quantity: 1, unitPrice: 0 }],
        }
  );
  const [errors, setErrors] = useState({});

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setItem = (idx, key, val) =>
    setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, [key]: val } : it) }));
  const addItem = () =>
    setForm(f => ({ ...f, items: [...f.items, { id: Date.now(), description: "", quantity: 1, unitPrice: 0 }] }));
  const removeItem = (idx) =>
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const validate = () => {
    const e = {};
    if (!form.clientName.trim()) e.clientName = "Client name is required.";
    if (!form.issueDate)         e.issueDate  = "Issue date is required.";
    if (!form.dueDate)           e.dueDate    = "Due date is required.";
    if (form.dueDate && form.issueDate && form.dueDate < form.issueDate)
      e.dueDate = "Due date cannot be before issue date.";
    form.items.forEach((it, i) => {
      if (!it.description.trim())   e[`item_desc_${i}`]  = "Required";
      if (Number(it.quantity) <= 0) e[`item_qty_${i}`]   = "Must be > 0";
      if (Number(it.unitPrice) < 0) e[`item_price_${i}`] = "Must be ≥ 0";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => { e.preventDefault(); if (validate()) onSave(form); };
  const total = calcInvoiceTotal(form.items);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Client Name" required value={form.clientName}
          onChange={e => set("clientName", e.target.value)} error={errors.clientName}
          placeholder="TechVision Lanka" className="col-span-2 sm:col-span-1" />
        <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
          <label className="text-brand-sub text-xs font-medium">Service Type</label>
          <select value={form.serviceType} onChange={e => set("serviceType", e.target.value)} className={fieldCls}>
            {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Input label="Issue Date" required type="date" value={form.issueDate}
          onChange={e => set("issueDate", e.target.value)} error={errors.issueDate} />
        <Input label="Due Date" required type="date" value={form.dueDate}
          onChange={e => set("dueDate", e.target.value)} error={errors.dueDate} />
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-brand-sub text-xs font-medium">Line Items</label>
          <button type="button" onClick={addItem}
            className="text-brand-green text-xs font-medium hover:text-brand-hover flex items-center gap-1 transition-colors">
            <Plus size={12} /> Add row
          </button>
        </div>
        <div className="border border-brand-border rounded overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-0 bg-brand-raised px-3 py-2 text-[10px] text-brand-sub font-medium uppercase tracking-wider border-b border-brand-border">
            <span className="col-span-5">Description</span>
            <span className="col-span-2 text-center">Qty</span>
            <span className="col-span-3 text-right">Unit Price</span>
            <span className="col-span-2 text-right">Total</span>
          </div>
          {form.items.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2.5 border-b border-brand-border/40 last:border-0">
              <div className="col-span-12 sm:col-span-5">
                <input value={item.description} onChange={e => setItem(idx, "description", e.target.value)}
                  placeholder="Item description"
                  className={`w-full px-2 py-1.5 bg-brand-bg border rounded text-brand-text text-sm placeholder:text-brand-sub/40 focus:outline-none focus:ring-1 focus:ring-brand-green/40 transition-all ${errors[`item_desc_${idx}`] ? "border-brand-red/60" : "border-brand-border"}`} />
              </div>
              <div className="col-span-4 sm:col-span-2">
                <input type="number" min="1" value={item.quantity}
                  onChange={e => setItem(idx, "quantity", e.target.value)}
                  className="w-full px-2 py-1.5 bg-brand-bg border border-brand-border rounded text-brand-text text-sm text-center focus:outline-none focus:ring-1 focus:ring-brand-green/40 transition-all" />
              </div>
              <div className="col-span-4 sm:col-span-3">
                <input type="number" min="0" step="0.01" value={item.unitPrice}
                  onChange={e => setItem(idx, "unitPrice", e.target.value)}
                  className="w-full px-2 py-1.5 bg-brand-bg border border-brand-border rounded text-brand-text text-sm text-right focus:outline-none focus:ring-1 focus:ring-brand-green/40 transition-all" />
              </div>
              <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1.5">
                <span className="text-brand-text text-xs font-medium tabular-nums">
                  {formatCurrency(calcLineTotal(item.quantity, item.unitPrice))}
                </span>
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-brand-sub hover:text-brand-red transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-end px-3 py-2.5 bg-brand-raised border-t border-brand-border">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-brand-sub">Total</span>
              <span className="text-brand-text font-bold tabular-nums">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-brand-sub text-xs font-medium">Notes</label>
        <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
          placeholder="Payment terms, additional notes…" rows={2}
          className={`${fieldCls} resize-none`} />
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit">
          {initial ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}

// ── InvoiceView ────────────────────────────────────────────────────────────────
function InvoiceView({ invoice, onEdit, onClose, onDownload, onMarkSent, canManage }) {
  if (!invoice) return null;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-brand-sub text-xs mb-1">Invoice Number</p>
          <p className="text-brand-text font-bold text-xl font-mono">{invoice.invoiceNumber}</p>
        </div>
        <Badge status={invoice.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
          <div>
            <p className="text-brand-sub text-xs mb-0.5">Client</p>
            <p className="text-brand-text font-semibold">{invoice.clientName}</p>
          </div>
          <div>
            <p className="text-brand-sub text-xs mb-0.5">Service Type</p>
            <p className="text-brand-text">{invoice.serviceType}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-brand-sub text-xs mb-0.5">Issue Date</p>
            <p className="text-brand-text">{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <p className="text-brand-sub text-xs mb-0.5">Due Date</p>
            <p className="text-brand-text">{formatDate(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      <div className="border border-brand-border rounded overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-2 bg-brand-raised text-[10px] text-brand-sub font-medium uppercase tracking-wider border-b border-brand-border">
          <span className="col-span-6">Description</span>
          <span className="col-span-2 text-center">Qty</span>
          <span className="col-span-2 text-right">Unit Price</span>
          <span className="col-span-2 text-right">Total</span>
        </div>
        {invoice.items.map((item, i) => (
          <div key={i} className="grid grid-cols-12 px-4 py-2.5 text-sm border-b border-brand-border/40 last:border-0">
            <span className="col-span-6 text-brand-text">{item.description}</span>
            <span className="col-span-2 text-center text-brand-sub">{item.quantity}</span>
            <span className="col-span-2 text-right text-brand-sub tabular-nums">{formatCurrency(item.unitPrice)}</span>
            <span className="col-span-2 text-right text-brand-text font-medium tabular-nums">
              {formatCurrency(calcLineTotal(item.quantity, item.unitPrice))}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-2.5 bg-brand-raised border-t border-brand-border">
          <span className="text-brand-sub text-sm">Total</span>
          <span className="text-brand-text font-bold tabular-nums">{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      {invoice.notes && (
        <div className="bg-brand-raised rounded p-3.5 border border-brand-border">
          <p className="text-brand-sub text-xs mb-1">Notes</p>
          <p className="text-brand-text text-sm leading-relaxed">{invoice.notes}</p>
        </div>
      )}

      <div className="flex gap-2.5 pt-1 flex-wrap">
        {canManage && invoice.status === "Draft" && (
          <Button variant="secondary" size="sm" onClick={() => onMarkSent(invoice)}>
            Mark as Sent
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onDownload(invoice)}>
          Export PDF
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        {canManage && (
          <Button variant="primary" size="sm" onClick={() => onEdit(invoice)}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const { invoices, createInvoice, updateInvoice, deleteInvoice, updateStatus } = useInvoices();
  const { can } = useAuth();
  const canManage = can("manage_invoices");

  const [search, setSearch]           = useState("");
  const [filterStatus, setFilter]     = useState("All");
  const [showCreate, setShowCreate]   = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);
  const [bulkExporting, setBulkExporting] = useState(false);

  const filtered = useMemo(() =>
    invoices.filter(inv => {
      const q = search.toLowerCase();
      const matchQ = !q || inv.clientName.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q);
      const matchS = filterStatus === "All" || inv.status === filterStatus;
      return matchQ && matchS;
    }),
    [invoices, search, filterStatus]
  );

  const stats = useMemo(() => ({
    total:   invoices.length,
    paid:    invoices.filter(i => i.status === "Paid").length,
    pending: invoices.filter(i => i.status === "Sent").length,
    overdue: invoices.filter(i => i.status === "Overdue").length,
  }), [invoices]);

  const handleCreate  = (data) => { createInvoice(data); setShowCreate(false); toast.success("Invoice created."); };
  const handleUpdate  = (data) => { updateInvoice(editInvoice.id, data); setEditInvoice(null); toast.success("Invoice updated."); };
  const handleDelete  = () => { deleteInvoice(deleteTarget.id); setDeleteTarget(null); toast.success("Invoice deleted."); };

  const handleMarkSent = (inv) => {
    updateStatus(inv.id, "Sent");
    setViewInvoice(null);
    toast.success(`${inv.invoiceNumber} marked as Sent.`);
  };

  const handleDownload = (inv) => {
    toast.promise(generateInvoicePDF({ ...inv, total: inv.total ?? calcInvoiceTotal(inv.items) }), {
      loading: "Generating PDF…", success: "PDF downloaded!", error: "Failed to generate PDF.",
    });
  };

  const handleDuplicate = (inv) => {
    const { id, invoiceNumber, createdAt, ...rest } = inv;
    createInvoice({ ...rest, status: "Draft", issueDate: new Date().toISOString().split("T")[0], dueDate: "" });
    toast.success("Invoice duplicated as Draft.");
  };

  const handleBulkExport = async () => {
    if (filtered.length === 0) return;
    setBulkExporting(true);
    try {
      for (const inv of filtered) {
        await generateInvoicePDF({ ...inv, total: inv.total ?? calcInvoiceTotal(inv.items) });
        await new Promise(r => setTimeout(r, 200));
      }
      toast.success(`${filtered.length} PDF(s) exported.`);
    } catch {
      toast.error("Some PDFs failed to export.");
    } finally {
      setBulkExporting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total",   value: stats.total,   cls: "text-brand-text" },
          { label: "Paid",    value: stats.paid,    cls: "text-brand-green" },
          { label: "Sent",    value: stats.pending, cls: "text-brand-blue" },
          { label: "Overdue", value: stats.overdue, cls: "text-brand-red" },
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
          placeholder="Search by client name or invoice number…"
          className="w-full px-3.5 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text text-sm placeholder:text-brand-sub/40 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-colors" />
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <select value={filterStatus} onChange={e => setFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-colors">
              <option value="All">All Status</option>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-sub pointer-events-none" />
          </div>
          <Button variant="ghost" size="sm" onClick={handleBulkExport} disabled={bulkExporting || filtered.length === 0}>
            {bulkExporting ? "Exporting…" : `Export PDF (${filtered.length})`}
          </Button>
          {canManage && (
            <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
              New Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-brand-border bg-brand-raised/60">
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Invoice #</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Client</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden sm:table-cell">Service</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden md:table-cell">Issued</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap hidden sm:table-cell">Due</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Amount</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] text-brand-sub uppercase tracking-wider font-medium whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <p className="text-brand-sub text-sm">
                      {search || filterStatus !== "All" ? "No invoices match your filters." : "No invoices yet. Create your first one."}
                    </p>
                  </td>
                </tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} className="border-b border-brand-border/40 last:border-0 hover:bg-brand-raised/40 transition-colors">
                  <td className="px-4 py-3 text-brand-text text-xs font-mono font-semibold whitespace-nowrap">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-brand-text text-sm font-medium max-w-[120px] truncate">{inv.clientName}</td>
                  <td className="px-4 py-3 text-brand-sub text-sm hidden sm:table-cell">{inv.serviceType}</td>
                  <td className="px-4 py-3 text-brand-sub text-sm whitespace-nowrap hidden md:table-cell">{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-3 text-brand-sub text-sm whitespace-nowrap hidden sm:table-cell">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3 text-brand-text text-sm font-semibold tabular-nums whitespace-nowrap">{formatCurrency(inv.total)}</td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <button onClick={() => setStatusTarget(inv)} title="Change status" className="hover:opacity-75 transition-opacity">
                        <Badge status={inv.status} />
                      </button>
                    ) : (
                      <Badge status={inv.status} />
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewInvoice(inv)}
                        className="text-brand-sub text-xs hover:text-brand-text transition-colors whitespace-nowrap">
                        View
                      </button>
                      {canManage && (
                        <button onClick={() => setEditInvoice(inv)}
                          className="text-brand-sub text-xs hover:text-brand-green transition-colors hidden sm:inline whitespace-nowrap">
                          Edit
                        </button>
                      )}
                      {canManage && (
                        <button onClick={() => handleDuplicate(inv)}
                          className="text-brand-sub text-xs hover:text-brand-text transition-colors hidden md:inline whitespace-nowrap">
                          Copy
                        </button>
                      )}
                      <button onClick={() => handleDownload(inv)}
                        className="text-brand-sub text-xs hover:text-brand-green transition-colors whitespace-nowrap">
                        PDF
                      </button>
                      {canManage && (
                        <button onClick={() => setDeleteTarget(inv)}
                          className="text-brand-sub text-xs hover:text-brand-red transition-colors hidden sm:inline whitespace-nowrap">
                          Del
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
            {filtered.length} of {invoices.length} invoices
          </div>
        )}
      </Card>

      {/* Status change popover */}
      {statusTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
          onClick={() => setStatusTarget(null)}>
          <div className="absolute inset-0" />
          <div className="relative bg-brand-surface border border-brand-border rounded-xl py-1.5 shadow-xl animate-scale-in min-w-[150px]"
            onClick={e => e.stopPropagation()}>
            <p className="text-brand-sub text-[10px] font-medium uppercase tracking-wider px-3 py-2">Change Status</p>
            {STATUSES.map(s => (
              <button key={s} onClick={() => { updateStatus(statusTarget.id, s); setStatusTarget(null); toast.success(`Status updated.`); }}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
                  statusTarget.status === s ? "text-brand-green font-medium" : "text-brand-sub hover:bg-brand-raised hover:text-brand-text"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {canManage && (
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Invoice" size="lg">
          <InvoiceForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
      {canManage && (
        <Modal isOpen={!!editInvoice} onClose={() => setEditInvoice(null)} title="Edit Invoice" size="lg">
          <InvoiceForm initial={editInvoice} onSave={handleUpdate} onCancel={() => setEditInvoice(null)} />
        </Modal>
      )}
      <Modal isOpen={!!viewInvoice} onClose={() => setViewInvoice(null)} title="Invoice Details" size="lg">
        <InvoiceView invoice={viewInvoice}
          onEdit={(inv) => { setViewInvoice(null); setEditInvoice(inv); }}
          onClose={() => setViewInvoice(null)}
          onDownload={handleDownload}
          onMarkSent={handleMarkSent}
          canManage={canManage} />
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Invoice"
        message={`Delete ${deleteTarget?.invoiceNumber} for ${deleteTarget?.clientName}? This cannot be undone.`}
        confirmLabel="Delete" danger />
    </div>
  );
}
