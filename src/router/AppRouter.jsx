import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Layout from "../components/layout/Layout";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import InvoicesPage from "../features/invoices/InvoicesPage";
import EmployeesPage from "../features/employees/EmployeesPage";
import SalaryPage from "../features/salary/SalaryPage";
import PayrollPage from "../features/payroll/PayrollPage";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/invoices/*" element={
            <RoleRoute allowedRoles={["Admin", "Finance Manager"]}>
              <InvoicesPage />
            </RoleRoute>
          } />
          <Route path="/employees" element={
            <RoleRoute allowedRoles={["Admin"]}>
              <EmployeesPage />
            </RoleRoute>
          } />
          <Route path="/salary" element={
            <RoleRoute allowedRoles={["Admin"]}>
              <SalaryPage />
            </RoleRoute>
          } />
          <Route path="/payroll" element={
            <RoleRoute allowedRoles={["Admin", "Finance Manager", "Employee"]}>
              <PayrollPage />
            </RoleRoute>
          } />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
