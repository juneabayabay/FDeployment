export default function DentistAuthButton({
  children,
  loading = false,
  icon: Icon,
  type = 'submit',
  disabled = false,
}) {
  return (
    <button type={type} className="dentist-auth-btn" disabled={disabled || loading}>
      {loading ? (
        <span className="dentist-auth-btn-spinner" aria-hidden />
      ) : (
        Icon && <Icon aria-hidden />
      )}
      {children}
    </button>
  );
}
