import { useState } from 'react';
import ErrorMessage from '../common/ErrorMessage';
import { parseApiError } from '../../utils/formatters';

export default function ClinicalRecordActions({
  record,
  fields,
  onUpdate,
  onDelete,
  canUpdate,
  canDelete,
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.name, record[f.name] ?? '']))
  );
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    try {
      await onUpdate(form);
      setEditing(false);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this record?')) return;
    setError('');
    try {
      await onDelete();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  if (editing) {
    return (
      <div className="space-y-2">
        {fields.map((f) => (
          <input
            key={f.name}
            type={f.type || 'text'}
            className="input w-full"
            value={form[f.name]}
            onChange={(e) => setForm((prev) => ({ ...prev, [f.name]: e.target.value }))}
          />
        ))}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary btn-sm" onClick={handleSave}>
            Save
          </button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canUpdate && (
        <button type="button" className="btn-outline btn-sm" onClick={() => setEditing(true)}>
          Edit
        </button>
      )}
      {canDelete && (
        <button type="button" className="btn-danger btn-sm" onClick={handleDelete}>
          Delete
        </button>
      )}
    </div>
  );
}
