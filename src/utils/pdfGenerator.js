import jsPDF from "jspdf";

// Color palette for white-background professional output
const C = {
  black:   [15,  17,  23],
  dark:    [40,  45,  55],
  mid:     [90, 100, 115],
  light:   [160, 168, 180],
  rule:    [220, 224, 230],
  bg:      [248, 249, 251],
  green:   [22, 163, 74],
  greenBg: [240, 253, 244],
  red:     [220, 38,  38],
  white:   [255, 255, 255],
  accent:  [22, 163, 74],
};

function lkr(amount) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency", currency: "LKR", minimumFractionDigits: 2,
  }).format(amount ?? 0);
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function hline(doc, y, x1, x2, color = C.rule, width = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
  doc.line(x1, y, x2, y);
}

function label(doc, text, x, y) {
  doc.setTextColor(...C.light);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(text.toUpperCase(), x, y);
}

function value(doc, text, x, y, opts = {}) {
  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setFontSize(opts.size ?? 8.5);
  doc.text(String(text ?? "—"), x, y, opts);
}

// ─── Invoice PDF ──────────────────────────────────────────────────────────────

export async function generateInvoicePDF(invoice) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 14, R = W - 14;

  // ── Header strip ──
  doc.setFillColor(...C.accent);
  doc.rect(0, 0, W, 1.5, "F");

  // Company
  doc.setTextColor(...C.accent);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("HSCLogic", L, 18);

  doc.setTextColor(...C.light);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Finance Management System", L, 24);

  // Document type (right)
  doc.setTextColor(...C.black);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", R, 20, { align: "right" });

  doc.setTextColor(...C.mid);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoice.invoiceNumber, R, 27, { align: "right" });

  hline(doc, 33, L, R, C.rule, 0.5);

  // ── Meta block ──
  let y = 40;
  const col2 = W / 2 + 5;

  label(doc, "Billed To", L, y);
  label(doc, "Invoice Details", col2, y);
  y += 5;

  value(doc, invoice.clientName, L, y, { bold: true });
  value(doc, invoice.invoiceNumber, col2, y);
  y += 5.5;

  value(doc, invoice.serviceType ?? "—", L, y);

  label(doc, "Issue Date", col2, y - 0.5);
  y += 4.5;
  value(doc, fmtDate(invoice.issueDate), col2, y);
  y += 5.5;

  label(doc, "Due Date", col2, y - 0.5);
  y += 4.5;
  value(doc, fmtDate(invoice.dueDate), col2, y);
  y += 5.5;

  label(doc, "Status", col2, y - 0.5);
  y += 4.5;
  value(doc, invoice.status, col2, y, { bold: true });

  y = Math.max(y + 10, 85);
  hline(doc, y, L, R, C.rule, 0.5);
  y += 7;

  // ── Line items table ──
  // Table header
  doc.setFillColor(...C.bg);
  doc.rect(L, y - 1, R - L, 8, "F");

  doc.setTextColor(...C.mid);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("DESCRIPTION", L + 2, y + 4);
  doc.text("QTY",   W - 68, y + 4, { align: "right" });
  doc.text("UNIT PRICE", W - 40, y + 4, { align: "right" });
  doc.text("AMOUNT", R - 1, y + 4, { align: "right" });
  y += 10;

  const items = invoice.items ?? [];
  items.forEach((item, i) => {
    const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

    if (i % 2 === 0) {
      doc.setFillColor(252, 253, 254);
      doc.rect(L, y - 1, R - L, 8, "F");
    }

    value(doc, item.description || "—", L + 2, y + 4);
    value(doc, String(item.quantity || 0), W - 68, y + 4, { align: "right" });
    value(doc, lkr(item.unitPrice || 0), W - 40, y + 4, { align: "right" });
    value(doc, lkr(lineTotal), R - 1, y + 4, { bold: true, align: "right" });
    y += 8;
  });

  hline(doc, y, L, R, C.rule, 0.3);
  y += 6;

  // Subtotal / Total
  const addTotalRow = (labelText, amount, highlight = false) => {
    if (highlight) {
      doc.setFillColor(...C.greenBg);
      doc.rect(L, y - 1.5, R - L, 9, "F");
      doc.setTextColor(...C.green);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
    } else {
      doc.setTextColor(...C.mid);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    doc.text(labelText, R - 40, y + 4);
    if (highlight) {
      doc.text(lkr(amount), R - 1, y + 4, { align: "right" });
    } else {
      doc.setTextColor(...C.dark);
      doc.text(lkr(amount), R - 1, y + 4, { align: "right" });
    }
    y += 9;
  };

  addTotalRow("Subtotal", invoice.total || 0);
  addTotalRow("Tax (0%)", 0);
  addTotalRow("TOTAL DUE", invoice.total || 0, true);

  y += 6;

  // Notes
  if (invoice.notes) {
    hline(doc, y, L, R, C.rule, 0.3);
    y += 6;
    label(doc, "Notes", L, y);
    y += 5;
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(invoice.notes, R - L);
    doc.text(lines, L, y);
    y += lines.length * 5;
  }

  // ── Footer ──
  hline(doc, H - 18, L, R, C.rule, 0.3);
  doc.setTextColor(...C.light);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Generated by HSCLogic Finance Management System", L, H - 10);
  doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), R, H - 10, { align: "right" });

  doc.save(`${invoice.invoiceNumber}.pdf`);
}

// ─── Payslip PDF ──────────────────────────────────────────────────────────────

export async function generatePayslipPDF(record, period) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 14, R = W - 14;

  // ── Header strip ──
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
  doc.setFontSize(20);
  doc.text("PAYSLIP", R, 20, { align: "right" });

  doc.setTextColor(...C.mid);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(period, R, 27, { align: "right" });

  hline(doc, 33, L, R, C.rule, 0.5);

  // ── Employee info ──
  let y = 40;
  const col2 = W / 2 + 5;

  label(doc, "Employee", L, y);
  label(doc, "Pay Period", col2, y);
  y += 5;

  value(doc, record.employeeName, L, y, { bold: true, size: 10 });
  value(doc, period, col2, y, { bold: true });
  y += 6;

  value(doc, record.designation ?? "—", L, y);
  label(doc, "Employee ID", col2, y - 0.5);
  y += 4.5;

  value(doc, record.department ?? "—", L, y);
  value(doc, record.employeeId, col2, y);
  y += 10;

  hline(doc, y, L, R, C.rule, 0.5);
  y += 8;

  // ── Earnings ──
  doc.setFillColor(...C.bg);
  doc.rect(L, y - 2, R - L, 7, "F");
  label(doc, "Earnings", L + 2, y + 2.5);
  y += 9;

  const earningRows = [
    ["Basic Salary", record.basic],
    ...(record.allowanceDetails?.length
      ? record.allowanceDetails.map(a => [a.name, a.amount])
      : record.allowances != null
        ? [["Allowances", record.allowances]]
        : []
    ),
  ];

  let totalEarnings = 0;
  earningRows.forEach(([lbl, amt]) => {
    totalEarnings += Number(amt) || 0;
    label(doc, lbl, L + 2, y);
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(lkr(amt), R - 1, y, { align: "right" });
    y += 6.5;
  });

  hline(doc, y, L + 2, R - 1, C.rule, 0.2);
  y += 4;
  label(doc, "Gross Earnings", L + 2, y);
  value(doc, lkr(totalEarnings), R - 1, y, { bold: true, align: "right" });
  y += 10;

  // ── Deductions ──
  doc.setFillColor(...C.bg);
  doc.rect(L, y - 2, R - L, 7, "F");
  label(doc, "Deductions", L + 2, y + 2.5);
  y += 9;

  const deductRows = record.deductionDetails?.length
    ? record.deductionDetails.map(d => [d.name, d.amount])
    : [["Total Deductions", record.deductions]];

  let totalDeductions = 0;
  deductRows.forEach(([lbl, amt]) => {
    totalDeductions += Number(amt) || 0;
    label(doc, lbl, L + 2, y);
    doc.setTextColor(...C.red);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text(`(${lkr(amt)})`, R - 1, y, { align: "right" });
    y += 6.5;
  });

  hline(doc, y, L + 2, R - 1, C.rule, 0.2);
  y += 4;
  label(doc, "Total Deductions", L + 2, y);
  doc.setTextColor(...C.red);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`(${lkr(totalDeductions)})`, R - 1, y, { align: "right" });
  y += 12;

  // ── Net salary ──
  doc.setFillColor(...C.greenBg);
  doc.rect(L, y, R - L, 14, "F");
  doc.setDrawColor(...C.green);
  doc.setLineWidth(0.5);
  doc.line(L, y, L, y + 14);

  doc.setTextColor(...C.green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("NET SALARY", L + 5, y + 5.5);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...C.mid);
  doc.text(`${lkr(totalEarnings)} - ${lkr(totalDeductions)}`, L + 5, y + 10.5);

  doc.setTextColor(...C.green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(lkr(record.net), R - 1, y + 9, { align: "right" });

  // ── Footer ──
  hline(doc, H - 18, L, R, C.rule, 0.3);
  doc.setTextColor(...C.light);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("This is a system-generated payslip — HSCLogic Finance Management System", L, H - 10);
  doc.text(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), R, H - 10, { align: "right" });

  doc.save(`Payslip-${record.employeeId}-${period.replace(/\s+/g, "-")}.pdf`);
}

// ─── Salary Structure Report ───────────────────────────────────────────────────

export async function generateSalaryReportPDF(employees, calcNetSalary) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const L = 14, R = W - 14;

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
  doc.text("SALARY REPORT", R, 20, { align: "right" });

  doc.setTextColor(...C.mid);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Generated: ${dateStr}`, R, 27, { align: "right" });

  hline(doc, 33, L, R, C.rule, 0.5);

  const active   = employees.filter(e => e.status === "Active");
  const totalNet = active.reduce((s, e) => s + calcNetSalary(e.salary), 0);

  let y = 40;
  label(doc, "Summary", L, y); y += 5;
  value(doc, `${active.length} active employees`, L, y);
  value(doc, `Total Monthly Payroll: ${lkr(totalNet)}`, R, y, { align: "right", bold: true });
  y += 10;

  hline(doc, y, L, R, C.rule, 0.5);
  y += 7;

  // Table header
  doc.setFillColor(...C.bg);
  doc.rect(L, y - 1, R - L, 8, "F");
  doc.setTextColor(...C.mid);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("EMPLOYEE", L + 2, y + 4);
  doc.text("DEPARTMENT",  78, y + 4);
  doc.text("BASIC",       120, y + 4, { align: "right" });
  doc.text("ALLOWANCES",  145, y + 4, { align: "right" });
  doc.text("DEDUCTIONS",  168, y + 4, { align: "right" });
  doc.text("NET",         R - 1, y + 4, { align: "right" });
  y += 10;

  active.forEach((emp, i) => {
    if (y > H - 30) {
      doc.addPage();
      y = 20;
    }
    const totalA = (emp.salary?.allowances ?? []).reduce((s, a) => s + (Number(a.amount) || 0), 0);
    const totalD = (emp.salary?.deductions ?? []).reduce((s, a) => s + (Number(a.amount) || 0), 0);
    const net    = calcNetSalary(emp.salary);

    if (i % 2 === 0) {
      doc.setFillColor(252, 253, 254);
      doc.rect(L, y - 1, R - L, 8, "F");
    }

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(emp.fullName, L + 2, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...C.mid);
    doc.setFontSize(7.5);
    doc.text(emp.department, 78, y + 4);
    doc.text(lkr(emp.salary?.basic ?? 0), 120, y + 4, { align: "right" });

    doc.setTextColor(...C.green);
    doc.text(lkr(totalA), 145, y + 4, { align: "right" });

    doc.setTextColor(...C.red);
    doc.text(`(${lkr(totalD)})`, 168, y + 4, { align: "right" });

    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "bold");
    doc.text(lkr(net), R - 1, y + 4, { align: "right" });
    y += 8;
  });

  hline(doc, y + 2, L, R, C.rule, 0.3);
  y += 7;

  doc.setFillColor(...C.greenBg);
  doc.rect(L, y, R - L, 10, "F");
  doc.setTextColor(...C.green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL MONTHLY PAYROLL", L + 4, y + 6.5);
  doc.text(lkr(totalNet), R - 1, y + 6.5, { align: "right" });

  hline(doc, H - 18, L, R, C.rule, 0.3);
  doc.setTextColor(...C.light);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("HSCLogic Finance Management System — Salary Structure Report", L, H - 10);
  doc.text(dateStr, R, H - 10, { align: "right" });

  doc.save(`Salary-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
