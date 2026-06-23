import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';

const STYLES = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
};

export default function Toast({ variant = 'success', title, message, onDismiss }) {
  if (!title && !message) return null;
  const Icon = variant === 'error' ? FiAlertCircle : FiCheckCircle;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed inset-x-4 top-4 z-50 mx-auto flex max-w-lg animate-fade-in items-start gap-3 rounded-xl px-4 py-4 shadow-lg sm:inset-x-auto sm:right-6 sm:left-auto ${STYLES[variant]}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {message && <p className="mt-1 text-sm text-white/90">{message}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-1 opacity-80 hover:opacity-100"
          aria-label="Dismiss notification"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
