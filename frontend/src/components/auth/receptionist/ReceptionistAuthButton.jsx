export default function ReceptionistAuthButton({
  children,
  loading = false,
  icon: Icon,
  type = 'submit',
  disabled = false,
}) {
  return (
    <button type={type} className="receptionist-auth-btn" disabled={disabled || loading}>
      {loading ? (
        <span className="receptionist-auth-btn-spinner" aria-hidden />
      ) : (
        Icon && <Icon aria-hidden />
      )}
      {children}
    </button>
  );
}
