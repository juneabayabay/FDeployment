import PasswordInput from '../../common/PasswordInput';

export default function ReceptionistAuthField({
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
    <div className="receptionist-auth-field">
      <label className="receptionist-auth-label" htmlFor={name}>
        {label}
      </label>
      <div className="receptionist-auth-input-wrap">
        {Icon && <Icon className="receptionist-auth-input-icon" aria-hidden />}
        {isPassword ? (
          <PasswordInput
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
            variant="receptionist"
          />
        ) : (
          <input
            id={name}
            name={name}
            className="receptionist-auth-input"
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
