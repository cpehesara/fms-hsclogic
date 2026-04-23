/**
 * @file AuthContext.jsx
 * @description Authentication state and role-based permission logic.
 *
 * Exposes: user, login, logout, loginError, setLoginError, can(action)
 *
 * The `can(action)` helper is the single source of truth for permission
 * checks throughout the UI. Components call it to conditionally render
 * write actions rather than comparing role strings directly, keeping
 * permission logic centralised here.
 *
 * NOTE: Credentials are stored in a mock array for demonstration purposes.
 * In a production system this module should be replaced with JWT-based
 * authentication against a secure backend API.
 */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const MOCK_USERS = [
  {
    id: "U-001",
    name: "Admin User",
    email: "admin@hsclogic.com",
    password: "admin123",
    role: "Admin",
    initials: "AD",
    avatar: null,
  },
  {
    id: "U-002",
    name: "Dilani Rathnayake",
    email: "dilani.r@hsclogic.com",
    password: "finance123",
    role: "Finance Manager",
    initials: "DR",
    avatar: null,
  },
  {
    id: "U-003",
    name: "Ashan Perera",
    email: "ashan.perera@hsclogic.com",
    password: "emp123",
    role: "Employee",
    initials: "AP",
    employeeId: "EMP-001",
    avatar: null,
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("fms-user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loginError, setLoginError] = useState("");

  const login = (email, password) => {
    const found = MOCK_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const { password: _p, ...safeUser } = found;
      setUser(safeUser);
      localStorage.setItem("fms-user", JSON.stringify(safeUser));
      setLoginError("");
      return true;
    }
    setLoginError("Invalid email or password.");
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fms-user");
  };

  const can = (action) => {
    if (!user) return false;
    const perms = {
      Admin: ["manage_invoices", "manage_employees", "manage_salary", "process_payroll", "view_payroll", "view_own_payslip"],
      "Finance Manager": ["manage_invoices", "view_payroll", "view_own_payslip"],
      Employee: ["view_own_payslip"],
    };
    return perms[user.role]?.includes(action) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginError, setLoginError, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
