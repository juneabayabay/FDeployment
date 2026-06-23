import { FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const VARIANTS = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
};

const ICONS = {
  success: FiCheckCircle,
  info: FiInfo,
  warning: FiInfo,
};

export default function AlertBanner({ message, variant = 'success', onDismiss }) {
  if (!message) return null;
  const Icon = ICONS[variant] || FiInfo;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${VARIANTS[variant] || VARIANTS.info}`}
      role="status"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{message}</div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
          aria-label="Dismiss"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
