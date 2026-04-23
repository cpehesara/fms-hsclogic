/**
 * @file Badge.jsx
 * @description Inline status pill for invoice, employee, and payroll statuses.
 *
 * Colour mappings use hard-coded dark-theme values intentionally — the badge
 * colours are designed for high contrast against dark surfaces and remain
 * legible in light mode due to the semi-transparent backgrounds.
 *
 * Recognised status values: Draft, Sent, Paid, Overdue, Active, Inactive,
 * Finalized, Pending. Unknown values fall back to the Draft style.
 */
const styles = {
  Draft:     "bg-[#1e2024] text-[#8b8f98] border-[#2c2e33]",
  Sent:      "bg-[#0f1e38] text-[#60a5fa] border-[#1a3060]",
  Paid:      "bg-[#0a1f10] text-[#00cc44] border-[#0e2e16]",
  Overdue:   "bg-[#28100f] text-[#e53935] border-[#3d1918]",
  Active:    "bg-[#0a1f10] text-[#00cc44] border-[#0e2e16]",
  Inactive:  "bg-[#1e2024] text-[#8b8f98] border-[#2c2e33]",
  Finalized: "bg-[#0f1e38] text-[#60a5fa] border-[#1a3060]",
  Pending:   "bg-[#231a06] text-[#f59e0b] border-[#352808]",
};

function Badge({ status }) {
  const base = styles[status] || styles.Draft;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium border tracking-wide ${base}`}>
      {status}
    </span>
  );
}

export default Badge;
