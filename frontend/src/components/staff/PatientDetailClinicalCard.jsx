import { formatDate, formatDateTime } from '../../utils/formatters';
import ClinicalRecordActions from '../clinical/ClinicalRecordActions';

export function TreatmentRecordCard({ record, canUpdate, canDelete, onUpdate, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-slate-900">{record.title}</p>
      <p className="mt-1 text-sm text-slate-500">{formatDate(record.treatment_date)}</p>
      {record.notes && <p className="mt-2 text-sm text-slate-600">{record.notes}</p>}
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

export function OrthodonticRecordCard({ record, canUpdate, canDelete, onUpdate, onDelete }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-slate-900">{record.phase || 'Orthodontic record'}</p>
      <p className="mt-1 text-sm text-slate-500">Updated {formatDateTime(record.updated_at)}</p>
      {record.progress_notes && (
        <p className="mt-2 text-sm text-slate-600">{record.progress_notes}</p>
      )}
      {(canUpdate || canDelete) && (
        <div className="mt-4 border-t border-slate-100 pt-4 [&_.input]:w-full">
          <ClinicalRecordActions
            record={record}
            fields={[
              { name: 'phase', type: 'text' },
              { name: 'progress_notes', type: 'text' },
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
      <p className="font-semibold text-slate-900">{record.procedure_name}</p>
      <p className="mt-1 text-sm text-slate-500">{formatDate(record.surgery_date)}</p>
      {record.notes && <p className="mt-2 text-sm text-slate-600">{record.notes}</p>}
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
