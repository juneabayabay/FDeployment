import { useState } from 'react';
import AppointmentCalendar from './AppointmentCalendar';
import ProcedureSelector from './ProcedureSelector';
import { toApiDate } from '../../utils/clinicDates';

export default function WaitingListForm({ procedures = [], onSubmit, onCancel, loading }) {
  const [selectedProcedures, setSelectedProcedures] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [notes, setNotes] = useState('');

  const toggleProcedure = (id) => {
    const numId = Number(id);
    setSelectedProcedures((prev) =>
      prev.includes(numId) ? prev.filter((x) => x !== numId) : [...prev, numId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      preferred_date: selectedDate ? toApiDate(selectedDate) : null,
      procedure_ids: selectedProcedures,
      notes,
    });
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-slate-900">Join waiting list</h3>
      <p className="text-sm text-slate-500">
        Select procedures and an optional preferred date. We will notify you when a slot opens.
      </p>

      <div>
        <p className="label mb-2">Procedures (optional)</p>
        <ProcedureSelector
          procedures={procedures}
          selected={selectedProcedures}
          onToggle={toggleProcedure}
        />
      </div>

      <div>
        <p className="label mb-2">Preferred date (optional)</p>
        <AppointmentCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      <label className="label">
        Notes
        <textarea
          className="input"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any preferences or symptoms..."
        />
      </label>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Joining...' : 'Join waiting list'}
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
