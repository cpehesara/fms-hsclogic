/**
 * @file Topbar.jsx
 * @description Top navigation bar rendered inside the authenticated Layout.
 *
 * Responsibilities:
 * - Shows the current page title derived from the active route
 * - Updates the browser <title> tag on each route change for accessibility
 *   and browser history readability (also aids SEO in pre-rendered contexts)
 * - Provides the hamburger toggle for the mobile sidebar drawer
 * - Houses the light/dark theme toggle button
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/invoices":  "Invoices",
  "/employees": "Employees",
  "/salary":    "Salary Structures",
  "/payroll":   "Payroll",
};

function Topbar({ onMenuToggle }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const currentPath = Object.keys(PAGE_TITLES).find(p => location.pathname.startsWith(p));
  const title = PAGE_TITLES[currentPath] ?? "HSClogic FMS";

  // Keep the browser tab title in sync with the active page
  useEffect(() => {
    document.title = `${title} — HSClogic FMS`;
  }, [title]);

  return (
    <header className="h-12 bg-brand-surface border-b border-brand-border flex items-center justify-between px-4 md:px-5 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="md:hidden text-brand-sub hover:text-brand-text transition-colors p-1 -ml-1"
          aria-label="Toggle menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 className="text-brand-text font-semibold text-sm">{title}</h1>
      </div>

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
