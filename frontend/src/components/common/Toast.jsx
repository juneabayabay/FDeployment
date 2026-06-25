import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';

const STYLES = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
};

const POSITION = {
  top: 'fixed inset-x-4 top-4 z-50 mx-auto max-w-lg sm:inset-x-auto sm:right-6 sm:left-auto',
  bottom: 'fixed bottom-9 right-9 z-50 max-w-sm rounded-full px-8 py-4',
};

export default function Toast({
  variant = 'success',
  title,
  message,
  onDismiss,
  position = 'top',
}) {
  if (!title && !message) return null;
  const Icon = variant === 'error' ? FiAlertCircle : FiCheckCircle;
  const isBottom = position === 'bottom';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`flex animate-fade-in items-start gap-3 shadow-lg ${STYLES[variant]} ${
        isBottom ? `${POSITION.bottom} items-center` : `${POSITION.top} rounded-xl px-4 py-4`
      }`}
    >
      <Icon className={`shrink-0 ${isBottom ? 'h-5 w-5' : 'mt-0.5 h-5 w-5'}`} aria-hidden />
      <div className="flex-1">
        {title && <p className={`font-semibold ${isBottom ? 'text-sm' : ''}`}>{title}</p>}
        {message && (
          <p className={`text-white/90 ${isBottom ? 'text-xs' : 'mt-1 text-sm'}`}>{message}</p>
        )}
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
