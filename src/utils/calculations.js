/**
 * @file calculations.js
 * @description Pure arithmetic helpers for invoice and salary computation.
 * All functions are side-effect free and safe to call in useMemo/useCallback.
 */

/**
 * Calculates the total value of a single invoice line item.
 *
 * @param {number|string} quantity  - Number of units.
 * @param {number|string} unitPrice - Price per unit in LKR.
 * @returns {number} Line total in LKR (0 if inputs are invalid).
 */
export const calcLineTotal = (quantity, unitPrice) => {
  return (Number(quantity) || 0) * (Number(unitPrice) || 0);
};

/**
 * Sums all line items to produce the invoice grand total.
 *
 * @param {Array<{quantity: number, unitPrice: number}>} items - Invoice line items.
 * @returns {number} Invoice total in LKR.
 */
export const calcInvoiceTotal = (items) => {
  if (!items || items.length === 0) return 0;
  return items.reduce((total, item) => total + calcLineTotal(item.quantity, item.unitPrice), 0);
};

/**
 * Computes an employee's net salary from their salary structure.
 * Formula: Net = Basic + Σ(Allowances) − Σ(Deductions)
 *
 * @param {{ basic: number, allowances: Array<{amount: number}>, deductions: Array<{amount: number}> }|null} salary
 * @returns {number} Net salary in LKR (0 if no salary structure is defined).
 */
export const calcNetSalary = (salary) => {
  if (!salary) return 0;
  const totalAllowances = salary.allowances?.reduce((sum, a) => sum + (Number(a.amount) || 0), 0) || 0;
  const totalDeductions = salary.deductions?.reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;
  return salary.basic + totalAllowances - totalDeductions;
};

/**
 * Determines whether an invoice has passed its due date without being paid.
 * Used by InvoiceContext to automatically derive "Overdue" status on every render.
 *
 * @param {string} dueDate - ISO date string (YYYY-MM-DD).
 * @param {string} status  - Current invoice status.
 * @returns {boolean} True if the invoice is past due and not yet paid.
 */
export const isOverdue = (dueDate, status) => {
  if (status === 'Paid') return false;
  return new Date(dueDate) < new Date();
};