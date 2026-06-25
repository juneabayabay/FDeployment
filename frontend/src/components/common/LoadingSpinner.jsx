export default function LoadingSpinner({ label = 'Loading...', fullPage = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? 'min-h-screen' : 'py-16'
      }`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
