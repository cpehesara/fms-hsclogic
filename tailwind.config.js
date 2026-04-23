export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          bg:      "var(--bg)",
          surface: "var(--surface)",
          raised:  "var(--raised)",
          border:  "var(--border)",
          text:    "var(--text)",
          sub:     "var(--sub)",
          green:   "var(--green)",
          hover:   "var(--green-dk)",
          red:     "var(--red)",
          amber:   "var(--amber)",
          blue:    "var(--blue)",
          elevated: "var(--raised)",
          muted:    "var(--sub)",
          danger:   "var(--red)",
          warning:  "var(--amber)",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
      },
      borderRadius: {
        sm:  "4px",
        DEFAULT: "6px",
        md:  "8px",
        lg:  "10px",
        xl:  "14px",
        "2xl": "20px",
      },
      animation: {
        "fade-in":  "fadeIn 0.18s ease-out",
        "slide-up": "slideUp 0.22s ease-out",
        "scale-in": "scaleIn 0.15s ease-out",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { from: { opacity: 0, transform: "scale(0.98)" }, to: { opacity: 1, transform: "scale(1)" } },
      },
    },
  },
  plugins: [],
}
