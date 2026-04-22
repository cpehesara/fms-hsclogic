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
    sm:   "max-w-md",
    md:   "max-w-lg",
    lg:   "max-w-2xl",
    xl:   "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className={`relative w-full ${sizes[size]} bg-brand-surface border border-brand-border rounded-xl shadow-2xl shadow-black/30 flex flex-col max-h-[90vh] animate-scale-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border flex-shrink-0">
          <h2 className="text-brand-text font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="text-brand-sub hover:text-brand-text transition-colors text-xs px-2 py-1 rounded hover:bg-brand-raised"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
