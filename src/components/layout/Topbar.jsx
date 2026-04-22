import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/invoices":  "Invoices",
  "/employees": "Employees",
  "/salary":    "Salary Structures",
  "/payroll":   "Payroll",
};

function Topbar() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const currentPath = Object.keys(PAGE_TITLES).find(p => location.pathname.startsWith(p));
  const title = PAGE_TITLES[currentPath] ?? "HSCLogic FMS";

  return (
    <header className="h-12 bg-brand-surface border-b border-brand-border flex items-center justify-between px-5 flex-shrink-0">
      <h1 className="text-brand-text font-semibold text-sm">{title}</h1>

      <button
        onClick={toggleTheme}
        className="text-brand-sub text-xs hover:text-brand-text transition-colors px-2 py-1 rounded hover:bg-brand-raised"
        title={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? "Light" : "Dark"}
      </button>
    </header>
  );
}

export default Topbar;
