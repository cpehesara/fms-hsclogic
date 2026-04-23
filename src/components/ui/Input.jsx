/**
 * @file Input.jsx
 * @description Labelled form input with integrated error, hint, and
 * optional prefix/suffix adornment support.
 *
 * @prop {string}  label        - Field label rendered above the input.
 * @prop {string}  error        - Validation error message shown in red below.
 * @prop {string}  hint         - Helper text shown below (only when no error).
 * @prop {boolean} required     - Appends a red asterisk to the label.
 * @prop {string}  prefix       - Decorative text overlaid at the left edge (e.g. "LKR").
 * @prop {string}  suffix       - Decorative text overlaid at the right edge.
 */
function Input({ label, error, hint, type = "text", className = "", inputClassName = "", required, prefix, suffix, ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-brand-sub text-xs font-medium">
          {label}{required && <span className="text-brand-red ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-brand-sub text-sm pointer-events-none select-none">{prefix}</span>
        )}
        <input
          type={type}
          required={required}
          className={`
            w-full bg-brand-bg border text-brand-text text-sm rounded-md
            px-3 py-2
            placeholder:text-brand-sub/40
            focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? "border-brand-red/60" : "border-brand-border"}
            ${prefix ? "pl-8" : ""}
            ${suffix ? "pr-8" : ""}
            ${inputClassName}
          `}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-brand-sub text-sm pointer-events-none select-none">{suffix}</span>
        )}
      </div>
      {error && <p className="text-brand-red text-xs">{error}</p>}
      {hint && !error && <p className="text-brand-sub text-xs">{hint}</p>}
    </div>
  );
}

export default Input;
