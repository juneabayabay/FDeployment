export default function AdminAuthButton({
  children,
  loading = false,
  icon: Icon,
  type = 'submit',
  disabled = false,
}) {
  return (
    <button type={type} className="admin-auth-btn" disabled={disabled || loading}>
      {loading ? (
        <span className="admin-auth-btn-spinner" aria-hidden />
      ) : (
        Icon && <Icon aria-hidden />
      )}
      {children}
    </button>
  );
}
