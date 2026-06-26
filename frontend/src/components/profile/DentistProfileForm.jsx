import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import { useMyDentistProfile, useUpdateMyDentistProfile } from '../../hooks/useDentists';
import { parseApiError } from '../../utils/formatters';

export default function DentistProfileForm({ onMessage, onError }) {
  const profile = useMyDentistProfile(true);
  const update = useUpdateMyDentistProfile();
  const [form, setForm] = useState(null);

  const values = form ?? {
    title: profile.data?.title ?? 'Dr.',
    specialization: profile.data?.specialization ?? '',
    years_experience: profile.data?.years_experience ?? 0,
    bio: profile.data?.bio ?? '',
    schedule_summary: profile.data?.schedule_summary ?? '',
    is_visible: profile.data?.is_visible ?? true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');
    onMessage('');
    try {
      await update.mutateAsync({
        ...values,
        years_experience: Number(values.years_experience) || 0,
      });
      setForm(null);
      onMessage('Directory profile updated.');
    } catch (err) {
      onError(parseApiError(err));
    }
  };

  if (profile.isLoading) {
    return <div className="card text-sm text-slate-500">Loading directory profile…</div>;
  }

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <div>
        <h3 className="font-semibold text-slate-900">Public directory profile</h3>
        <p className="text-sm text-slate-500">
          Shown to patients when they browse dentists and book appointments.
        </p>
      </div>
      <ErrorMessage message={profile.isError ? parseApiError(profile.error) : ''} />
      {[
        ['title', 'Title'],
        ['specialization', 'Specialization'],
        ['schedule_summary', 'Schedule summary'],
      ].map(([field, label]) => (
        <label key={field} className="label">
          {label}
          <input
            className="input"
            value={values[field]}
            onChange={(e) => setForm((p) => ({ ...(p ?? values), [field]: e.target.value }))}
          />
        </label>
      ))}
      <label className="label">
        Years of experience
        <input
          className="input"
          type="number"
          min="0"
          max="80"
          value={values.years_experience}
          onChange={(e) =>
            setForm((p) => ({ ...(p ?? values), years_experience: e.target.value }))
          }
        />
      </label>
      <label className="label">
        Bio
        <textarea
          className="input"
          rows={4}
          value={values.bio}
          onChange={(e) => setForm((p) => ({ ...(p ?? values), bio: e.target.value }))}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={values.is_visible}
          onChange={(e) =>
            setForm((p) => ({ ...(p ?? values), is_visible: e.target.checked }))
          }
        />
        Show my profile in the patient directory
      </label>
      <button type="submit" className="btn-primary" disabled={update.isPending}>
        {update.isPending ? 'Saving…' : 'Save directory profile'}
      </button>
    </form>
  );
}
