export default function PatientAuthButton({
  children,
  loading = false,
  icon: Icon,
  type = 'submit',
  disabled = false,
}) {
  return (
    <button type={type} className="patient-auth-btn" disabled={disabled || loading}>
      {loading ? (
        <span className="patient-auth-btn-spinner" aria-hidden />
      ) : (
        Icon && <Icon aria-hidden />
      )}
      {children}
    </button>
  );
}
