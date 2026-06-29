import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import { useCreateWalkInPatient } from '../../hooks/usePatients';
import { parseApiError } from '../../utils/formatters';

const emptyWalkInForm = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  date_of_birth: '',
  medical_history: '',
  allergies: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
};

export default function WalkInPatientForm({ onSuccess, onCancel, compact = false }) {
  const [form, setForm] = useState(emptyWalkInForm);
  const [error, setError] = useState('');
  const createMutation = useCreateWalkInPatient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: form.phone.trim(),
      ...(form.email.trim() ? { email: form.email.trim() } : {}),
      ...(form.date_of_birth ? { date_of_birth: form.date_of_birth } : {}),
      ...(form.medical_history.trim() ? { medical_history: form.medical_history.trim() } : {}),
      ...(form.allergies.trim() ? { allergies: form.allergies.trim() } : {}),
      ...(form.emergency_contact_name.trim()
        ? { emergency_contact_name: form.emergency_contact_name.trim() }
        : {}),
      ...(form.emergency_contact_phone.trim()
        ? { emergency_contact_phone: form.emergency_contact_phone.trim() }
        : {}),
    };

    try {
      const { data } = await createMutation.mutateAsync(payload);
      setForm(emptyWalkInForm);
      onSuccess?.(data);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-4' : 'card grid gap-4 sm:grid-cols-2'}>
      <div className={compact ? 'space-y-1' : 'sm:col-span-2'}>
        <h2 className="text-lg font-semibold text-clinic-heading">Register walk-in patient</h2>
        <p className="text-sm text-clinic-subtle">
          Phone is required. Email is optional — a clinic-only account is created if omitted.
        </p>
      </div>

      <ErrorMessage message={error} />

      <label className="label">
        First name
        <input
          className="input"
          value={form.first_name}
          onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
          required
        />
      </label>
      <label className="label">
        Last name
        <input
          className="input"
          value={form.last_name}
          onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
          required
        />
      </label>
      <label className="label">
        Phone
        <input
          className="input"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          required
        />
      </label>
      <label className="label">
        Email <span className="font-normal text-clinic-subtle">(optional)</span>
        <input
          className="input"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="Leave blank for walk-in account"
        />
      </label>
      <label className="label">
        Date of birth <span className="font-normal text-clinic-subtle">(optional)</span>
        <input
          className="input"
          type="date"
          value={form.date_of_birth}
          onChange={(e) => setForm((f) => ({ ...f, date_of_birth: e.target.value }))}
        />
      </label>
      <label className="label sm:col-span-2">
        Medical history <span className="font-normal text-clinic-subtle">(optional)</span>
        <textarea
          className="input min-h-[4rem]"
          value={form.medical_history}
          onChange={(e) => setForm((f) => ({ ...f, medical_history: e.target.value }))}
        />
      </label>
      <label className="label sm:col-span-2">
        Allergies <span className="font-normal text-clinic-subtle">(optional)</span>
        <textarea
          className="input min-h-[4rem]"
          value={form.allergies}
          onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
        />
      </label>
      <label className="label">
        Emergency contact name
        <input
          className="input"
          value={form.emergency_contact_name}
          onChange={(e) => setForm((f) => ({ ...f, emergency_contact_name: e.target.value }))}
        />
      </label>
      <label className="label">
        Emergency contact phone
        <input
          className="input"
          type="tel"
          value={form.emergency_contact_phone}
          onChange={(e) => setForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))}
        />
      </label>

      <div className={`flex flex-wrap gap-2 ${compact ? '' : 'sm:col-span-2'}`}>
        <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Registering…' : 'Register walk-in'}
        </button>
        {onCancel && (
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
