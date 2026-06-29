import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const VARIANT_CLASSES = {
  patient: {
    input: 'patient-auth-input patient-auth-input--password',
    toggle: 'patient-auth-toggle',
  },
  admin: {
    input: 'admin-auth-input admin-auth-input--password',
    toggle: 'admin-auth-toggle',
  },
  receptionist: {
    input: 'receptionist-auth-input receptionist-auth-input--password',
    toggle: 'receptionist-auth-toggle',
  },
  dentist: {
    input: 'dentist-auth-input dentist-auth-input--password',
    toggle: 'dentist-auth-toggle',
  },
};

export default function PasswordInput({
  id,
  name,
  value,
  onChange,
  required = true,
  className = '',
  autoComplete,
  disabled = false,
  variant = 'default',
}) {
  const [visible, setVisible] = useState(false);
  const themed = VARIANT_CLASSES[variant];

  const inputClass = themed
    ? `${themed.input} ${className}`.trim()
    : `input w-full pr-10 ${className}`.trim();

  const toggleClass = themed
    ? themed.toggle
    : 'absolute inset-y-0 right-0 flex items-center px-3 text-clinic-subtle hover:text-clinic-body disabled:opacity-50';

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        className={inputClass}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
      />
      <button
        type="button"
        className={toggleClass}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        disabled={disabled}
      >
        {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
      </button>
    </div>
  );
}
