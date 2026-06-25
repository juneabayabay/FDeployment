import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import PatientDetailAppointmentCard from '../../components/staff/PatientDetailAppointmentCard';
import PatientDetailBillingCard from '../../components/staff/PatientDetailBillingCard';
import {
  TreatmentRecordCard,
  OrthodonticRecordCard,
  SurgicalRecordCard,
} from '../../components/staff/PatientDetailClinicalCard';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import { usePatient, useUpdatePatient } from '../../hooks/usePatients';
import { useStaffAppointments } from '../../hooks/useStaffAppointments';
import { useStaffBilling } from '../../hooks/useStaffBilling';
import {
  usePatientTreatments,
  usePatientOrthodontic,
  usePatientSurgical,
  useCreateTreatment,
  useCreateOrthodontic,
  useCreateSurgical,
  useUpdateTreatment,
  useUpdateOrthodontic,
  useUpdateSurgical,
  useDeleteTreatment,
  useDeleteOrthodontic,
  useDeleteSurgical,
} from '../../hooks/useClinical';
import ClinicalRecordActions from '../../components/clinical/ClinicalRecordActions';
import TreatmentTimeline from '../../components/dentist/TreatmentTimeline';
import { useStaffPaths } from '../../hooks/useStaffPaths';
import { usePermission } from '../../hooks/usePermission';
import {
  formatDate,
  formatDateTime,
  formatPrice,
  formatTime,
  parseApiError,
  unwrapList,
} from '../../utils/formatters';
import { getStatusBadgeClass, getStatusLabel, getPaymentStatusLabel } from '../../utils/appointmentStatus';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'billing', label: 'Billing' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'orthodontic', label: 'Orthodontic' },
  { id: 'surgical', label: 'Surgical' },
  { id: 'timeline', label: 'Timeline' },
];

export default function AdminPatientDetailPage() {
  const { id } = useParams();
  const { path } = useStaffPaths();
  const { can } = usePermission();
  const [tab, setTab] = useState('profile');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editForm, setEditForm] = useState(null);

  const patient = usePatient(id);
  const updateMutation = useUpdatePatient();


  const appointments = useStaffAppointments(
    { patient_id: id },
    { enabled: tab === 'appointments' && Boolean(id) }
  );
  const billing = useStaffBilling(
    { patient_id: id },
    { enabled: tab === 'billing' && Boolean(id) }
  );
  const treatments = usePatientTreatments(id, tab === 'treatments' || tab === 'timeline');
  const orthodontic = usePatientOrthodontic(id, tab === 'orthodontic' || tab === 'timeline');
  const surgical = usePatientSurgical(id, tab === 'surgical' || tab === 'timeline');
  const createTreatment = useCreateTreatment(id);
  const createOrthodontic = useCreateOrthodontic(id);
  const createSurgical = useCreateSurgical(id);
  const updateTreatment = useUpdateTreatment(id);
  const updateOrthodontic = useUpdateOrthodontic(id);
  const updateSurgical = useUpdateSurgical(id);
  const deleteTreatment = useDeleteTreatment(id);
  const deleteOrthodontic = useDeleteOrthodontic(id);
  const deleteSurgical = useDeleteSurgical(id);

  const p = patient.data;
  const apptRows = unwrapList(appointments.data);
  const billRows = unwrapList(billing.data);

  const startEdit = () => {
    setEditForm({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      phone: p.phone || '',
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateMutation.mutateAsync({ id, data: editForm });
      setMessage('Patient profile updated.');
      setEditForm(null);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const appointmentColumns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.appointment_date) },
    {
      key: 'time',
      label: 'Time',
      render: (r) => `${formatTime(r.start_time)} – ${formatTime(r.end_time)}`,
    },
    {
      key: 'procedures',
      label: 'Procedures',
      render: (r) => (r.procedures || []).map((x) => x.name).join(', ') || '—',
    },
    { key: 'amount', label: 'Amount', render: (r) => formatPrice(r.total_amount) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={`badge ${getStatusBadgeClass(r.status)}`}>{getStatusLabel(r.status)}</span>
      ),
    },
    {
      key: 'fee',
      label: 'Cancel fee',
      render: (r) => (r.cancellation_fee ? formatPrice(r.cancellation_fee) : '—'),
    },
  ];

  const billingColumns = [
    { key: 'description', label: 'Description' },
    {
      key: 'date',
      label: 'Date',
      render: (r) =>
        r.appointment_date
          ? formatDate(r.appointment_date)
          : formatDate(r.created_at?.slice(0, 10)),
    },
    { key: 'total', label: 'Total', render: (r) => formatPrice(r.total_amount) },
    { key: 'paid', label: 'Paid', render: (r) => formatPrice(r.amount_paid) },
    { key: 'balance', label: 'Balance', render: (r) => formatPrice(r.balance) },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={`badge ${getStatusBadgeClass(r.payment_status)}`}>
          {getPaymentStatusLabel(r.payment_status)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={p ? p.full_name || `${p.first_name} ${p.last_name}`.trim() || p.email : 'Patient record'}
        subtitle={p?.email}
        actions={
          <Link to={path('/patients')} className="btn-outline btn-sm">
            ← Back to patients
          </Link>
        }
      />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      <QueryState
        isLoading={patient.isLoading}
        isError={patient.isError}
        error={patient.error}
        onRetry={() => patient.refetch()}
      >
        <div className="-mx-4 overflow-x-auto border-b border-slate-200 px-4 md:mx-0 md:px-0 [scrollbar-width:thin]">
          <div className="flex w-max min-w-full gap-1 sm:gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`shrink-0 border-b-2 px-3 py-2 text-sm font-medium sm:px-4 ${
                  tab === t.id
                    ? 'border-sky-600 text-sky-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'profile' && p && (
          <div className="card space-y-4">
            {!editForm ? (
              <>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">Name</dt>
                    <dd className="text-slate-900">
                      {p.full_name || `${p.first_name} ${p.last_name}`.trim()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">Email</dt>
                    <dd className="text-slate-900">{p.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">Phone</dt>
                    <dd className="text-slate-900">{p.phone || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">Status</dt>
                    <dd>
                      <span
                        className={`badge ${p.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">Registered</dt>
                    <dd className="text-slate-900">{formatDate(p.created_at?.slice(0, 10))}</dd>
                  </div>
                </dl>
                {can('patients.update') && (
                  <button type="button" className="btn-outline btn-sm" onClick={startEdit}>
                    Edit profile
                  </button>
                )}
              </>
            ) : (
              <form onSubmit={handleSaveProfile} className="grid gap-4 sm:grid-cols-2">
                {['first_name', 'last_name', 'phone'].map((field) => (
                  <label key={field} className="label capitalize">
                    {field.replace('_', ' ')}
                    <input
                      className="input"
                      value={editForm[field]}
                      onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                    />
                  </label>
                ))}
                <div className="flex gap-2 sm:col-span-2">
                  <button type="submit" className="btn-primary btn-sm" disabled={updateMutation.isPending}>
                    Save
                  </button>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => setEditForm(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === 'treatments' && can('treatments.view') && (
          <QueryState isLoading={treatments.isLoading} isError={treatments.isError} error={treatments.error}>
            {can('treatments.create') && (
              <form
                className="card mb-4 grid gap-3 sm:grid-cols-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    await createTreatment.mutateAsync({
                      title: fd.get('title'),
                      treatment_date: fd.get('treatment_date'),
                      notes: fd.get('notes'),
                    });
                    setMessage('Treatment record added.');
                    e.target.reset();
                  } catch (err) {
                    setError(parseApiError(err));
                  }
                }}
              >
                <input name="title" className="input" placeholder="Title" required />
                <input name="treatment_date" type="date" className="input" required />
                <input name="notes" className="input" placeholder="Notes" />
                <button type="submit" className="btn-primary btn-sm sm:col-span-3">Add treatment</button>
              </form>
            )}
            <DataTable
              columns={[
                { key: 'title', label: 'Title' },
                { key: 'treatment_date', label: 'Date', render: (r) => formatDate(r.treatment_date) },
                { key: 'notes', label: 'Notes' },
                {
                  key: 'actions',
                  label: '',
                  render: (r) => (
                    <ClinicalRecordActions
                      record={r}
                      fields={[
                        { name: 'title', type: 'text' },
                        { name: 'treatment_date', type: 'date' },
                        { name: 'notes', type: 'text' },
                      ]}
                      canUpdate={can('treatments.update')}
                      canDelete={can('treatments.delete')}
                      onUpdate={(data) => updateTreatment.mutateAsync({ id: r.id, data })}
                      onDelete={() => deleteTreatment.mutateAsync(r.id)}
                    />
                  ),
                },
              ]}
              rows={treatments.data || []}
              emptyMessage="No treatment records."
              renderMobileCard={(r) => (
                <TreatmentRecordCard
                  record={r}
                  canUpdate={can('treatments.update')}
                  canDelete={can('treatments.delete')}
                  onUpdate={(data) => updateTreatment.mutateAsync({ id: r.id, data })}
                  onDelete={() => deleteTreatment.mutateAsync(r.id)}
                />
              )}
            />
          </QueryState>
        )}

        {tab === 'orthodontic' && can('treatments.view') && (
          <QueryState isLoading={orthodontic.isLoading} isError={orthodontic.isError} error={orthodontic.error}>
            {can('treatments.create') && (
              <form
                className="card mb-4 grid gap-3 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    await createOrthodontic.mutateAsync({
                      phase: fd.get('phase'),
                      progress_notes: fd.get('progress_notes'),
                    });
                    setMessage('Orthodontic record added.');
                    e.target.reset();
                  } catch (err) {
                    setError(parseApiError(err));
                  }
                }}
              >
                <input name="phase" className="input" placeholder="Phase" />
                <input name="progress_notes" className="input" placeholder="Progress notes" />
                <button type="submit" className="btn-primary btn-sm sm:col-span-2">Add record</button>
              </form>
            )}
            <DataTable
              columns={[
                { key: 'phase', label: 'Phase' },
                { key: 'progress_notes', label: 'Progress' },
                { key: 'updated_at', label: 'Updated', render: (r) => formatDateTime(r.updated_at) },
                {
                  key: 'actions',
                  label: '',
                  render: (r) => (
                    <ClinicalRecordActions
                      record={r}
                      fields={[
                        { name: 'phase', type: 'text' },
                        { name: 'progress_notes', type: 'text' },
                      ]}
                      canUpdate={can('treatments.update')}
                      canDelete={can('treatments.delete')}
                      onUpdate={(data) => updateOrthodontic.mutateAsync({ id: r.id, data })}
                      onDelete={() => deleteOrthodontic.mutateAsync(r.id)}
                    />
                  ),
                },
              ]}
              rows={orthodontic.data || []}
              emptyMessage="No orthodontic records."
              renderMobileCard={(r) => (
                <OrthodonticRecordCard
                  record={r}
                  canUpdate={can('treatments.update')}
                  canDelete={can('treatments.delete')}
                  onUpdate={(data) => updateOrthodontic.mutateAsync({ id: r.id, data })}
                  onDelete={() => deleteOrthodontic.mutateAsync(r.id)}
                />
              )}
            />
          </QueryState>
        )}

        {tab === 'surgical' && can('treatments.view') && (
          <QueryState isLoading={surgical.isLoading} isError={surgical.isError} error={surgical.error}>
            {can('treatments.create') && (
              <form
                className="card mb-4 grid gap-3 sm:grid-cols-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    await createSurgical.mutateAsync({
                      procedure_name: fd.get('procedure_name'),
                      surgery_date: fd.get('surgery_date'),
                      notes: fd.get('notes'),
                    });
                    setMessage('Surgical record added.');
                    e.target.reset();
                  } catch (err) {
                    setError(parseApiError(err));
                  }
                }}
              >
                <input name="procedure_name" className="input" placeholder="Procedure" required />
                <input name="surgery_date" type="date" className="input" required />
                <input name="notes" className="input" placeholder="Notes" />
                <button type="submit" className="btn-primary btn-sm sm:col-span-3">Add surgical record</button>
              </form>
            )}
            <DataTable
              columns={[
                { key: 'procedure_name', label: 'Procedure' },
                { key: 'surgery_date', label: 'Date', render: (r) => formatDate(r.surgery_date) },
                { key: 'notes', label: 'Notes' },
                {
                  key: 'actions',
                  label: '',
                  render: (r) => (
                    <ClinicalRecordActions
                      record={r}
                      fields={[
                        { name: 'procedure_name', type: 'text' },
                        { name: 'surgery_date', type: 'date' },
                        { name: 'notes', type: 'text' },
                      ]}
                      canUpdate={can('treatments.update')}
                      canDelete={can('treatments.delete')}
                      onUpdate={(data) => updateSurgical.mutateAsync({ id: r.id, data })}
                      onDelete={() => deleteSurgical.mutateAsync(r.id)}
                    />
                  ),
                },
              ]}
              rows={surgical.data || []}
              emptyMessage="No surgical records."
              renderMobileCard={(r) => (
                <SurgicalRecordCard
                  record={r}
                  canUpdate={can('treatments.update')}
                  canDelete={can('treatments.delete')}
                  onUpdate={(data) => updateSurgical.mutateAsync({ id: r.id, data })}
                  onDelete={() => deleteSurgical.mutateAsync(r.id)}
                />
              )}
            />
          </QueryState>
        )}

        {tab === 'timeline' && can('treatments.view') && (
          <QueryState
            isLoading={treatments.isLoading || orthodontic.isLoading || surgical.isLoading}
            isError={treatments.isError || orthodontic.isError || surgical.isError}
            error={treatments.error || orthodontic.error || surgical.error}
          >
            <div className="card">
              <TreatmentTimeline
                treatments={treatments.data || []}
                orthodontic={orthodontic.data || []}
                surgical={surgical.data || []}
              />
            </div>
          </QueryState>
        )}

        {tab === 'appointments' && (
          <QueryState
            isLoading={appointments.isLoading}
            isError={appointments.isError}
            error={appointments.error}
            onRetry={() => appointments.refetch()}
          >
            <DataTable
              columns={appointmentColumns}
              rows={apptRows}
              emptyMessage="No appointments found for this patient."
              renderMobileCard={(r) => <PatientDetailAppointmentCard appointment={r} />}
            />
          </QueryState>
        )}

        {tab === 'billing' && (
          <QueryState
            isLoading={billing.isLoading}
            isError={billing.isError}
            error={billing.error}
            onRetry={() => billing.refetch()}
          >
            <DataTable
              columns={billingColumns}
              rows={billRows}
              emptyMessage="No billing records found for this patient."
              renderMobileCard={(r) => <PatientDetailBillingCard record={r} />}
            />
          </QueryState>
        )}
      </QueryState>
    </div>
  );
}
