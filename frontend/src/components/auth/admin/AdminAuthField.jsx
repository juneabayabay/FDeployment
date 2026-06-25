import PasswordInput from '../../common/PasswordInput';

export default function AdminAuthField({
  icon: Icon,
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = true,
  autoComplete,
  disabled = false,
  showToggle = false,
}) {
  const isPassword = type === 'password' || showToggle;

  return (
    <div className="admin-auth-field">
      <label className="admin-auth-label" htmlFor={name}>
        {label}
      </label>
      <div className="admin-auth-input-wrap">
        {Icon && <Icon className="admin-auth-input-icon" aria-hidden />}
        {isPassword ? (
          <PasswordInput
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
            variant="admin"
          />
        ) : (
          <input
            id={name}
            name={name}
            className="admin-auth-input"
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
