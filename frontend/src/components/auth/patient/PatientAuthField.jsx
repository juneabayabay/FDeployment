import PasswordInput from '../../common/PasswordInput';

export default function PatientAuthField({
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
    <div className="patient-auth-field">
      <label className="patient-auth-label" htmlFor={name}>
        {label}
      </label>
      <div className="patient-auth-input-wrap">
        {Icon && <Icon className="patient-auth-input-icon" aria-hidden />}
        {isPassword ? (
          <PasswordInput
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            autoComplete={autoComplete}
            disabled={disabled}
            variant="patient"
          />
        ) : (
          <input
            id={name}
            name={name}
            className="patient-auth-input"
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
