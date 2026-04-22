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
                    background: 'var(--brand-elevated)',
                    color: 'var(--brand-text)',
                    border: '1px solid var(--brand-border)',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif",
                  },
                  success: {
                    iconTheme: { primary: '#10B981', secondary: 'var(--brand-elevated)' },
                  },
                  error: {
                    iconTheme: { primary: '#EF4444', secondary: 'var(--brand-elevated)' },
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
