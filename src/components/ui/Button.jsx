/**
 * @file Button.jsx
 * @description Reusable button component with variant and size presets.
 *
 * Variants:
 *   primary   — Solid brand-green, used for the primary call-to-action.
 *   secondary — Outlined, used for secondary or cancel actions.
 *   danger    — Red-tinted outline, used for destructive actions.
 *   ghost     — No background, used for low-emphasis icon/text actions.
 *
 * Sizes: xs | sm | md (default) | lg
 *
 * All variants apply accessible focus rings and a disabled opacity state.
 */
function Button({
  children, onClick, variant = "primary", size = "md",
  disabled = false, type = "button", className = "", title = "",
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[var(--bg)]";

  const sizes = {
    xs: "px-2.5 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
  };

  const variants = {
    primary:   "bg-brand-green text-white hover:bg-brand-hover focus:ring-brand-green",
    secondary: "bg-transparent border border-brand-border text-brand-text hover:bg-brand-raised focus:ring-brand-border",
    danger:    "bg-transparent border border-brand-red/40 text-brand-red hover:bg-brand-red/10 focus:ring-brand-red",
    ghost:     "bg-transparent text-brand-sub hover:text-brand-text hover:bg-brand-raised focus:ring-brand-border",
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title}
      className={`${base} ${sizes[size] ?? sizes.md} ${variants[variant] ?? variants.primary} ${className}`}>
      {children}
    </button>
  );
}

export default Button;
