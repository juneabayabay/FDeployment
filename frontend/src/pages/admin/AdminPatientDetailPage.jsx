import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import PatientDetailAppointmentCard from '../../components/staff/PatientDetailAppointmentCard';
import PatientDetailBillingCard from '../../components/staff/PatientDetailBillingCard';
import {
  TreatmentRecordCard,
  OrthodonticRecordCard,
  SurgicalRecordCard,
  PrescriptionRecordCard,
} from '../../components/staff/PatientDetailClinicalCard';
import ErrorMessage from '../../components/common/ErrorMessage';
import Avatar from '../../components/common/Avatar';
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
  usePatientPrescriptions,
  useCreateTreatment,
  useCreateOrthodontic,
  useCreateSurgical,
  useCreatePrescription,
  useUpdateTreatment,
  useUpdateOrthodontic,
  useUpdateSurgical,
  useUpdatePrescription,
  useDeleteTreatment,
  useDeleteOrthodontic,
  useDeleteSurgical,
  useDeletePrescription,
  useScheduleOrthodonticNext,
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
import { getStatusBadgeClass, getStatusLabel, getPaymentStatusLabel, getBookingSourceLabel, getBookingSourceBadgeClass } from '../../utils/appointmentStatus';
import { ROLES } from '../../utils/constants';

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'billing', label: 'Billing' },
  { id: 'treatments', label: 'Treatments' },
  { id: 'orthodontic', label: 'Orthodontic' },
  { id: 'surgical', label: 'Surgical' },
  { id: 'prescriptions', label: 'Prescriptions' },
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
  const prescriptions = usePatientPrescriptions(
    id,
    tab === 'prescriptions' || tab === 'timeline'
  );
  const createTreatment = useCreateTreatment(id);
  const createOrthodontic = useCreateOrthodontic(id);
  const createSurgical = useCreateSurgical(id);
  const createPrescription = useCreatePrescription(id);
  const updateTreatment = useUpdateTreatment(id);
  const updateOrthodontic = useUpdateOrthodontic(id);
  const updateSurgical = useUpdateSurgical(id);
  const updatePrescription = useUpdatePrescription(id);
  const deleteTreatment = useDeleteTreatment(id);
  const deleteOrthodontic = useDeleteOrthodontic(id);
  const deleteSurgical = useDeleteSurgical(id);
  const deletePrescription = useDeletePrescription(id);
  const scheduleOrthodonticNext = useScheduleOrthodonticNext(id);

  const p = patient.data;
  const apptRows = unwrapList(appointments.data);
  const billRows = unwrapList(billing.data);

  const startEdit = () => {
    setEditForm({
      first_name: p.first_name || '',
      last_name: p.last_name || '',
      phone: p.phone || '',
      date_of_birth: p.date_of_birth || '',
      medical_history: p.medical_history || '',
      allergies: p.allergies || '',
      emergency_contact_name: p.emergency_contact_name || '',
      emergency_contact_phone: p.emergency_contact_phone || '',
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...editForm,
        date_of_birth: editForm.date_of_birth || null,
      };
      await updateMutation.mutateAsync({ id, data: payload });
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
      key: 'source',
      label: 'Source',
      render: (r) =>
        r.booking_source && r.booking_source !== 'online' ? (
          <span className={`badge ${getBookingSourceBadgeClass(r.booking_source)}`}>
            {getBookingSourceLabel(r.booking_source)}
          </span>
        ) : (
          '—'
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
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <Avatar
                    user={{
                      ...p,
                      role_slugs: p.role_slugs?.length ? p.role_slugs : [ROLES.USER],
                    }}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {p.full_name || `${p.first_name} ${p.last_name}`.trim()}
                    </p>
                    <p className="text-sm text-slate-500">{p.email}</p>
                  </div>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
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
                  <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">Date of birth</dt>
                    <dd className="text-slate-900">
                      {p.date_of_birth ? formatDate(p.date_of_birth) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase text-slate-400">Age</dt>
                    <dd className="text-slate-900">{p.age != null ? `${p.age} years` : '—'}</dd>
                  </div>
                </dl>
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Medical history</h4>
                  <dl className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase text-slate-400">Medical history</dt>
                      <dd className="whitespace-pre-wrap text-slate-900">
                        {p.medical_history || '—'}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs font-medium uppercase text-slate-400">Allergies</dt>
                      <dd className="whitespace-pre-wrap text-slate-900">{p.allergies || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium uppercase text-slate-400">
                        Emergency contact
                      </dt>
                      <dd className="text-slate-900">
                        {p.emergency_contact_name
                          ? `${p.emergency_contact_name}${p.emergency_contact_phone ? ` (${p.emergency_contact_phone})` : ''}`
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
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
                <label className="label sm:col-span-2">
                  Date of birth
                  <input
                    className="input"
                    type="date"
                    value={editForm.date_of_birth}
                    onChange={(e) => setEditForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                  />
                </label>
                <label className="label sm:col-span-2">
                  Medical history
                  <textarea
                    className="input min-h-[80px]"
                    value={editForm.medical_history}
                    onChange={(e) => setEditForm((f) => ({ ...f, medical_history: e.target.value }))}
                  />
                </label>
                <label className="label sm:col-span-2">
                  Allergies
                  <textarea
                    className="input min-h-[60px]"
                    value={editForm.allergies}
                    onChange={(e) => setEditForm((f) => ({ ...f, allergies: e.target.value }))}
                  />
                </label>
                <label className="label">
                  Emergency contact name
                  <input
                    className="input"
                    value={editForm.emergency_contact_name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, emergency_contact_name: e.target.value }))
                    }
                  />
                </label>
                <label className="label">
                  Emergency contact phone
                  <input
                    className="input"
                    type="tel"
                    value={editForm.emergency_contact_phone}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, emergency_contact_phone: e.target.value }))
                    }
                  />
                </label>
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
                      next_adjustment_date: fd.get('next_adjustment_date') || null,
                      adjustment_interval_weeks: fd.get('adjustment_interval_weeks')
                        ? Number(fd.get('adjustment_interval_weeks'))
                        : null,
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
                <input name="next_adjustment_date" type="date" className="input" placeholder="Next adjustment" />
                <input
                  name="adjustment_interval_weeks"
                  type="number"
                  min="1"
                  className="input"
                  placeholder="Interval (weeks)"
                />
                <button type="submit" className="btn-primary btn-sm sm:col-span-2">Add record</button>
              </form>
            )}
            <DataTable
              columns={[
                { key: 'phase', label: 'Phase' },
                { key: 'progress_notes', label: 'Progress' },
                {
                  key: 'next_adjustment_date',
                  label: 'Next adjustment',
                  render: (r) =>
                    r.next_adjustment_date ? formatDate(r.next_adjustment_date) : '—',
                },
                {
                  key: 'interval',
                  label: 'Interval',
                  render: (r) =>
                    r.adjustment_interval_weeks ? `${r.adjustment_interval_weeks} wks` : '—',
                },
                { key: 'updated_at', label: 'Updated', render: (r) => formatDateTime(r.updated_at) },
                {
                  key: 'actions',
                  label: '',
                  render: (r) => (
                    <div className="space-y-2">
                      {can('treatments.create') && r.next_adjustment_date && (
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          disabled={scheduleOrthodonticNext.isPending}
                          onClick={async () => {
                            try {
                              await scheduleOrthodonticNext.mutateAsync(r.id);
                              setMessage('Next adjustment appointment scheduled.');
                            } catch (err) {
                              setError(parseApiError(err));
                            }
                          }}
                        >
                          Schedule next adjustment
                        </button>
                      )}
                      <ClinicalRecordActions
                        record={r}
                        fields={[
                          { name: 'phase', type: 'text' },
                          { name: 'progress_notes', type: 'text' },
                          { name: 'next_adjustment_date', type: 'date' },
                          { name: 'adjustment_interval_weeks', type: 'number' },
                        ]}
                        canUpdate={can('treatments.update')}
                        canDelete={can('treatments.delete')}
                        onUpdate={(data) =>
                          updateOrthodontic.mutateAsync({
                            id: r.id,
                            data: {
                              ...data,
                              adjustment_interval_weeks: data.adjustment_interval_weeks
                                ? Number(data.adjustment_interval_weeks)
                                : null,
                            },
                          })
                        }
                        onDelete={() => deleteOrthodontic.mutateAsync(r.id)}
                      />
                    </div>
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
                  onUpdate={(data) =>
                    updateOrthodontic.mutateAsync({
                      id: r.id,
                      data: {
                        ...data,
                        adjustment_interval_weeks: data.adjustment_interval_weeks
                          ? Number(data.adjustment_interval_weeks)
                          : null,
                      },
                    })
                  }
                  onDelete={() => deleteOrthodontic.mutateAsync(r.id)}
                  onScheduleNext={
                    can('treatments.create') && r.next_adjustment_date
                      ? async (record) => {
                          try {
                            await scheduleOrthodonticNext.mutateAsync(record.id);
                            setMessage('Next adjustment appointment scheduled.');
                          } catch (err) {
                            setError(parseApiError(err));
                          }
                        }
                      : null
                  }
                  scheduling={scheduleOrthodonticNext.isPending}
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

        {tab === 'prescriptions' && can('treatments.view') && (
          <QueryState
            isLoading={prescriptions.isLoading}
            isError={prescriptions.isError}
            error={prescriptions.error}
          >
            {can('treatments.create') && (
              <form
                className="card mb-4 grid gap-3 sm:grid-cols-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    await createPrescription.mutateAsync({
                      medication: fd.get('medication'),
                      dosage: fd.get('dosage'),
                      prescribed_date: fd.get('prescribed_date'),
                      instructions: fd.get('instructions'),
                    });
                    setMessage('Prescription added.');
                    e.target.reset();
                  } catch (err) {
                    setError(parseApiError(err));
                  }
                }}
              >
                <input name="medication" className="input" placeholder="Medication" required />
                <input name="dosage" className="input" placeholder="Dosage" required />
                <input name="prescribed_date" type="date" className="input" required />
                <input name="instructions" className="input" placeholder="Instructions" />
                <button type="submit" className="btn-primary btn-sm sm:col-span-2">
                  Add prescription
                </button>
              </form>
            )}
            <DataTable
              columns={[
                { key: 'medication', label: 'Medication' },
                { key: 'dosage', label: 'Dosage' },
                {
                  key: 'prescribed_date',
                  label: 'Date',
                  render: (r) => formatDate(r.prescribed_date),
                },
                { key: 'instructions', label: 'Instructions' },
                {
                  key: 'prescribed_by_name',
                  label: 'Prescribed by',
                  render: (r) => r.prescribed_by_name || '—',
                },
                {
                  key: 'actions',
                  label: '',
                  render: (r) => (
                    <ClinicalRecordActions
                      record={r}
                      fields={[
                        { name: 'medication', type: 'text' },
                        { name: 'dosage', type: 'text' },
                        { name: 'prescribed_date', type: 'date' },
                        { name: 'instructions', type: 'text' },
                      ]}
                      canUpdate={can('treatments.update')}
                      canDelete={can('treatments.delete')}
                      onUpdate={(data) => updatePrescription.mutateAsync({ id: r.id, data })}
                      onDelete={() => deletePrescription.mutateAsync(r.id)}
                    />
                  ),
                },
              ]}
              rows={prescriptions.data || []}
              emptyMessage="No prescriptions."
              renderMobileCard={(r) => (
                <PrescriptionRecordCard
                  record={r}
                  canUpdate={can('treatments.update')}
                  canDelete={can('treatments.delete')}
                  onUpdate={(data) => updatePrescription.mutateAsync({ id: r.id, data })}
                  onDelete={() => deletePrescription.mutateAsync(r.id)}
                />
              )}
            />
          </QueryState>
        )}

        {tab === 'timeline' && can('treatments.view') && (
          <QueryState
            isLoading={
              treatments.isLoading ||
              orthodontic.isLoading ||
              surgical.isLoading ||
              prescriptions.isLoading
            }
            isError={
              treatments.isError ||
              orthodontic.isError ||
              surgical.isError ||
              prescriptions.isError
            }
            error={
              treatments.error || orthodontic.error || surgical.error || prescriptions.error
            }
          >
            <div className="card">
              <TreatmentTimeline
                treatments={treatments.data || []}
                orthodontic={orthodontic.data || []}
                surgical={surgical.data || []}
                prescriptions={prescriptions.data || []}
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
