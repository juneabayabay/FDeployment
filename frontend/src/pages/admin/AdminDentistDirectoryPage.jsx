import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import ErrorMessage from '../../components/common/ErrorMessage';
import QueryState from '../../components/common/QueryState';
import DentistCard from '../../components/dentists/DentistCard';
import { useDentistProfiles, useUpdateDentistProfile } from '../../hooks/useDentists';
import { usePermission } from '../../hooks/usePermission';
import { parseApiError } from '../../utils/formatters';

function EditDentistProfileForm({ profile, onClose, onSaved }) {
  const update = useUpdateDentistProfile();
  const [form, setForm] = useState({
    title: profile.title || 'Dr.',
    specialization: profile.specialization || '',
    years_experience: profile.years_experience ?? 0,
    bio: profile.bio || '',
    schedule_summary: profile.schedule_summary || '',
    is_visible: profile.is_visible ?? true,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await update.mutateAsync({
        id: profile.id,
        data: {
          ...form,
          years_experience: Number(form.years_experience) || 0,
        },
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <form className="mt-4 space-y-3 border-t border-slate-200 pt-4" onSubmit={handleSubmit}>
      <ErrorMessage message={error} />
      {[
        ['title', 'Title'],
        ['specialization', 'Specialization'],
        ['schedule_summary', 'Schedule summary'],
      ].map(([field, label]) => (
        <label key={field} className="label">
          {label}
          <input
            className="input"
            value={form[field]}
            onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
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
          value={form.years_experience}
          onChange={(e) => setForm((p) => ({ ...p, years_experience: e.target.value }))}
        />
      </label>
      <label className="label">
        Bio
        <textarea
          className="input"
          rows={3}
          value={form.bio}
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.is_visible}
          onChange={(e) => setForm((p) => ({ ...p, is_visible: e.target.checked }))}
        />
        Visible in patient directory
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary btn-sm" disabled={update.isPending}>
          Save
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminDentistDirectoryPage() {
  const { can } = usePermission();
  const profiles = useDentistProfiles();
  const list = profiles.data?.results ?? [];
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const editingProfile = list.find((p) => p.id === editingId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dentist directory"
        subtitle="Manage public profiles shown to patients when booking"
      />

      {message && <div className="alert-success">{message}</div>}

      <QueryState
        isLoading={profiles.isLoading}
        isError={profiles.isError}
        error={profiles.error}
        onRetry={() => profiles.refetch()}
        isEmpty={!profiles.isLoading && list.length === 0}
        emptyTitle="No dentist profiles"
        emptyDescription="Create dentist staff accounts first — profiles are created automatically."
      >
        <div className="space-y-4">
          {list.map((profile) => (
            <div key={profile.id} className="card">
              <DentistCard dentist={profile} />
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    profile.is_visible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {profile.is_visible ? 'Visible to patients' : 'Hidden'}
                </span>
                {can('dentists.manage') && (
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    onClick={() => setEditingId(editingId === profile.id ? null : profile.id)}
                  >
                    {editingId === profile.id ? 'Close editor' : 'Edit profile'}
                  </button>
                )}
              </div>
              {editingId === profile.id && editingProfile && (
                <EditDentistProfileForm
                  profile={editingProfile}
                  onClose={() => setEditingId(null)}
                  onSaved={() => setMessage('Dentist profile updated.')}
                />
              )}
            </div>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
