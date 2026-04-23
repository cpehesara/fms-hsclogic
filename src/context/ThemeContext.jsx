/**
 * @file ThemeContext.jsx
 * @description Light/dark theme management with localStorage persistence.
 *
 * Exposes: theme ("dark" | "light"), toggleTheme, isDark (boolean)
 *
 * Theme is applied by toggling the "light" and "dark" class on the root
 * <html> element. All colour values are CSS custom properties defined in
 * index.css under :root (dark, default) and :root.light (light override),
 * so switching is instantaneous with no FOUC.
 */
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("fms-theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("fms-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
