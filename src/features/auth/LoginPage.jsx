import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";

const DEMO_ACCOUNTS = [
  { role: "Admin",           email: "admin@hsclogic.com",        password: "admin123" },
  { role: "Finance Manager", email: "dilani.r@hsclogic.com",     password: "finance123" },
  { role: "Employee",        email: "ashan.perera@hsclogic.com", password: "emp123" },
];

export default function LoginPage() {
  const { login, loginError, setLoginError } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 450));
    login(email, password);
    setLoading(false);
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setLoginError?.("");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex animate-fade-in">
      {/* Left panel */}
      <div className="hidden lg:flex w-80 flex-col justify-between border-r border-brand-border p-8 bg-brand-surface">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="HSCLogic" className="w-6 h-6 object-contain flex-shrink-0" />
          <span className="text-brand-text font-semibold text-sm tracking-tight">HSCLogic</span>
        </div>

        <div className="space-y-4">
          <p className="text-brand-text font-semibold text-xl leading-snug">
            Finance operations,<br />all in one place.
          </p>
          <p className="text-brand-sub text-sm leading-relaxed">
            Manage invoices, process payroll, track salary structures and employee records from a single unified dashboard.
          </p>
        </div>

        <p className="text-brand-sub/40 text-xs">© 2026 HSCLogic. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        <button
          onClick={toggleTheme}
          className="absolute top-5 right-5 text-brand-sub text-xs hover:text-brand-text transition-colors px-2 py-1 rounded hover:bg-brand-raised"
        >
          {isDark ? "Light mode" : "Dark mode"}
        </button>

        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src={logo} alt="HSCLogic" className="w-6 h-6 object-contain" />
            <span className="text-brand-text font-semibold text-sm">HSCLogic FMS</span>
          </div>

          <div className="mb-7">
            <h1 className="text-brand-text font-bold text-2xl leading-tight">Sign in</h1>
            <p className="text-brand-sub text-sm mt-1.5">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-brand-sub text-xs font-medium">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setLoginError?.(""); }}
                placeholder="you@hsclogic.com"
                autoComplete="email"
                required
                className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border rounded-md text-brand-text text-sm placeholder:text-brand-sub/40 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-brand-sub text-xs font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLoginError?.(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 bg-brand-bg border border-brand-border rounded-md text-brand-text text-sm placeholder:text-brand-sub/40 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-sub hover:text-brand-text transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="px-3.5 py-2.5 bg-brand-red/8 border border-brand-red/20 rounded-md animate-fade-in">
                <p className="text-brand-red text-xs">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-brand-green hover:bg-brand-hover text-white font-semibold text-sm rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-brand-border">
            <p className="text-brand-sub/60 text-xs mb-3">Demo accounts — click to fill</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-md border border-brand-border bg-brand-raised hover:bg-brand-surface hover:border-brand-green/30 text-left transition-all"
                >
                  <div>
                    <p className="text-brand-text text-xs font-medium leading-tight">{acc.role}</p>
                    <p className="text-brand-sub text-xs mt-0.5">{acc.email}</p>
                  </div>
                  <span className="text-brand-sub/60 text-xs font-mono">{acc.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
