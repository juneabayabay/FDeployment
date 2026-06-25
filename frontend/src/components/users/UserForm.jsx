import ErrorMessage from '../common/ErrorMessage';

export default function UserForm({ form, onChange, onSubmit, submitLabel, loading, error }) {
  const fields = [
    { name: 'first_name', label: 'First name', type: 'text' },
    { name: 'last_name', label: 'Last name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone', type: 'text', required: false },
    { name: 'password', label: 'Password', type: 'password' },
    { name: 'password_confirm', label: 'Confirm password', type: 'password' },
  ];

  return (
    <form className="card max-w-lg space-y-4" onSubmit={onSubmit}>
      <ErrorMessage message={error} />
      {fields.map((field) => (
        <label key={field.name} className="label">
          {field.label}
          <input
            className="input"
            name={field.name}
            type={field.type}
            value={form[field.name] || ''}
            onChange={onChange}
            required={field.required !== false}
          />
        </label>
      ))}
      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
