import PasswordInput from '../../common/PasswordInput';

export default function DentistAuthField({
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
    <div className="dentist-auth-field">
      <label className="dentist-auth-label" htmlFor={name}>
        {label}
      </label>
      <div className="dentist-auth-input-wrap">
        {Icon && <Icon className="dentist-auth-input-icon" aria-hidden />}
        {isPassword ? (
          <PasswordInput
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
            variant="dentist"
          />
        ) : (
          <input
            id={name}
            name={name}
            className="dentist-auth-input"
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
