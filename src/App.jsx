/**
 * @file App.jsx
 * @description Application root. Composes all context providers and renders
 * the router alongside the global toast notification layer.
 *
 * Provider order matters — inner providers may depend on outer ones:
 *   ThemeProvider   — no dependencies
 *   AuthProvider    — no dependencies
 *   EmployeeProvider — no dependencies
 *   InvoiceProvider  — no dependencies
 *   PayrollProvider  — depends on EmployeeProvider (reads activeEmployees)
 *
 * The Toaster is rendered outside the router so toast messages survive
 * route transitions.
 */
import { Toaster } from "react-hot-toast";
import AppRouter from './router/AppRouter';
import { InvoiceProvider } from "./context/InvoiceContext";
import { EmployeeProvider } from "./context/EmployeeContext";
import { PayrollProvider } from "./context/PayrollContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EmployeeProvider>
          <InvoiceProvider>
            <PayrollProvider>
              <AppRouter />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--raised)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  },
                  success: {
                    iconTheme: { primary: '#00cc44', secondary: 'var(--raised)' },
                  },
                  error: {
                    iconTheme: { primary: '#e53935', secondary: 'var(--raised)' },
                  },
                  duration: 3000,
                }}
              />
            </PayrollProvider>
          </InvoiceProvider>
        </EmployeeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
