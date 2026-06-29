export default function LoadingSpinner({ label = 'Loading...', fullPage = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullPage ? 'min-h-screen' : 'py-16'
      }`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-clinic-100 border-t-clinic-500" />
      <p className="text-sm text-clinic-subtle">{label}</p>
    </div>
  );
}
