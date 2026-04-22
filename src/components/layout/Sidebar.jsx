import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const navItems = [
  { path: "/dashboard", label: "Dashboard",       roles: ["Admin", "Finance Manager", "Employee"] },
  { path: "/invoices",  label: "Invoices",        roles: ["Admin", "Finance Manager"] },
  { path: "/employees", label: "Employees",       roles: ["Admin"] },
  { path: "/salary",    label: "Salary",          roles: ["Admin"] },
  { path: "/payroll",   label: "Payroll",         roles: ["Admin", "Finance Manager", "Employee"] },
];

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const visibleNav = navItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <aside className="w-56 h-screen bg-brand-surface border-r border-brand-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-brand-border">
        <img src={logo} alt="HSCLogic" className="w-6 h-6 object-contain flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-brand-text font-semibold text-sm leading-tight tracking-tight">HSCLogic</p>
          <p className="text-brand-sub text-xs leading-tight">Finance Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-brand-sub/50 text-[10px] font-medium uppercase tracking-widest px-2 mb-2">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {visibleNav.map(({ path, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <li key={path}>
                <NavLink
                  to={path}
                  className={`flex items-center px-2.5 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    isActive
                      ? "bg-brand-green/10 text-brand-green"
                      : "text-brand-sub hover:bg-brand-raised hover:text-brand-text"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand-green rounded-r" />
                  )}
                  {label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 py-3 border-t border-brand-border space-y-0.5">
          <div className="px-2.5 py-2">
            <p className="text-brand-text text-xs font-semibold leading-tight truncate">{user.name}</p>
            <p className="text-brand-sub text-xs leading-tight mt-0.5">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-2.5 py-2 rounded-md text-brand-sub text-sm hover:text-brand-red hover:bg-brand-red/5 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
