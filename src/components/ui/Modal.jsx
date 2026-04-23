/**
 * @file Modal.jsx
 * @description Accessible modal dialog with responsive bottom-sheet behaviour.
 *
 * On desktop (md+) renders as a centred dialog. On mobile renders as a
 * bottom-sheet that slides up from the screen edge, matching native mobile
 * patterns. A visual drag handle is shown on mobile.
 *
 * Accessibility:
 * - Escape key closes the modal (keydown listener attached while open)
 * - Body scroll is locked while the modal is open
 * - Clicking the backdrop closes the modal
 *
 * Size presets: sm | md (default) | lg | xl | full
 * Each maps to a max-w-* class applied at the md breakpoint.
 */
import { useEffect } from "react";

function Modal({ isOpen, onClose, title, children, size = "md", footer }) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm:   "md:max-w-md",
    md:   "md:max-w-lg",
    lg:   "md:max-w-2xl",
    xl:   "md:max-w-4xl",
    full: "md:max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />

      <div className={`
        relative w-full ${sizes[size]}
        bg-brand-surface border border-brand-border
        rounded-t-2xl md:rounded-xl
        shadow-2xl shadow-black/30
        flex flex-col
        max-h-[92vh] md:max-h-[90vh]
        animate-scale-in
      `}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border flex-shrink-0">
          {/* Mobile drag handle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-brand-border rounded-full md:hidden" />
          <h2 className="text-brand-text font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="text-brand-sub hover:text-brand-text transition-colors text-xs px-2 py-1 rounded hover:bg-brand-raised"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="px-5 md:px-6 py-4 border-t border-brand-border flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
