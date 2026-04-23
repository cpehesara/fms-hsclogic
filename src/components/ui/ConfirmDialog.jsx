/**
 * @file ConfirmDialog.jsx
 * @description Blocking confirmation dialog for destructive actions.
 *
 * Always pair with a descriptive `message` prop that clearly states the
 * consequence (e.g. "This cannot be undone"). Pass `danger={true}` to
 * render the confirm button in the danger variant (red outline).
 *
 * Clicking the backdrop or the Cancel button calls `onClose` without
 * invoking `onConfirm`.
 */
import Button from "./Button";

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", danger = false }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative w-full max-w-sm bg-brand-surface border border-brand-border rounded-xl shadow-2xl shadow-black/30 animate-scale-in p-6">
        <h3 className="text-brand-text font-semibold text-sm mb-2">{title}</h3>
        <p className="text-brand-sub text-sm leading-relaxed mb-5">{message}</p>

        <div className="flex gap-2.5">
          <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            size="sm"
            className="flex-1"
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
