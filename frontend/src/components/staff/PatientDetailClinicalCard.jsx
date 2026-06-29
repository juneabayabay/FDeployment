import { formatDate, formatDateTime } from '../../utils/formatters';
import ClinicalRecordActions from '../clinical/ClinicalRecordActions';

export function TreatmentRecordCard({ record, canUpdate, canDelete, onUpdate, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-clinic-heading">{record.title}</p>
      <p className="mt-1 text-sm text-clinic-subtle">{formatDate(record.treatment_date)}</p>
      {record.notes && <p className="mt-2 text-sm text-clinic-body">{record.notes}</p>}
      {(canUpdate || canDelete) && (
        <div className="mt-4 border-t border-slate-100 pt-4 [&_.input]:w-full">
          <ClinicalRecordActions
            record={record}
            fields={[
              { name: 'title', type: 'text' },
              { name: 'treatment_date', type: 'date' },
              { name: 'notes', type: 'text' },
            ]}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      )}
    </article>
  );
}

export function OrthodonticRecordCard({ record, canUpdate, canDelete, onUpdate, onDelete, onScheduleNext, scheduling }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-clinic-heading">{record.phase || 'Orthodontic record'}</p>
      <p className="mt-1 text-sm text-clinic-subtle">Updated {formatDateTime(record.updated_at)}</p>
      {record.next_adjustment_date && (
        <p className="mt-1 text-sm text-clinic-body">
          Next adjustment: {formatDate(record.next_adjustment_date)}
          {record.adjustment_interval_weeks
            ? ` · every ${record.adjustment_interval_weeks} weeks`
            : ''}
        </p>
      )}
      {record.progress_notes && (
        <p className="mt-2 text-sm text-clinic-body">{record.progress_notes}</p>
      )}
      {onScheduleNext && record.next_adjustment_date && (
        <button
          type="button"
          className="btn-primary btn-sm mt-3"
          disabled={scheduling}
          onClick={() => onScheduleNext(record)}
        >
          Schedule next adjustment
        </button>
      )}
      {(canUpdate || canDelete) && (
        <div className="mt-4 border-t border-slate-100 pt-4 [&_.input]:w-full">
          <ClinicalRecordActions
            record={record}
            fields={[
              { name: 'phase', type: 'text' },
              { name: 'progress_notes', type: 'text' },
              { name: 'next_adjustment_date', type: 'date' },
              { name: 'adjustment_interval_weeks', type: 'number' },
            ]}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      )}
    </article>
  );
}

export function SurgicalRecordCard({ record, canUpdate, canDelete, onUpdate, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-clinic-heading">{record.procedure_name}</p>
      <p className="mt-1 text-sm text-clinic-subtle">{formatDate(record.surgery_date)}</p>
      {record.notes && <p className="mt-2 text-sm text-clinic-body">{record.notes}</p>}
      {(canUpdate || canDelete) && (
        <div className="mt-4 border-t border-slate-100 pt-4 [&_.input]:w-full">
          <ClinicalRecordActions
            record={record}
            fields={[
              { name: 'procedure_name', type: 'text' },
              { name: 'surgery_date', type: 'date' },
              { name: 'notes', type: 'text' },
            ]}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      )}
    </article>
  );
}

export function PrescriptionRecordCard({ record, canUpdate, canDelete, onUpdate, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-clinic-heading">{record.medication}</p>
      <p className="mt-1 text-sm text-clinic-body">Dosage: {record.dosage}</p>
      <p className="mt-1 text-sm text-clinic-subtle">{formatDate(record.prescribed_date)}</p>
      {record.prescribed_by_name && (
        <p className="mt-1 text-xs text-clinic-muted">Prescribed by {record.prescribed_by_name}</p>
      )}
      {record.instructions && <p className="mt-2 text-sm text-clinic-body">{record.instructions}</p>}
      {(canUpdate || canDelete) && (
        <div className="mt-4 border-t border-slate-100 pt-4 [&_.input]:w-full">
          <ClinicalRecordActions
            record={record}
            fields={[
              { name: 'medication', type: 'text' },
              { name: 'dosage', type: 'text' },
              { name: 'prescribed_date', type: 'date' },
              { name: 'instructions', type: 'text' },
            ]}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      )}
    </article>
  );
}
