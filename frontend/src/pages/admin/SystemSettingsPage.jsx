import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import ErrorMessage from '../../components/common/ErrorMessage';
import AlertBanner from '../../components/common/AlertBanner';
import QueryState from '../../components/common/QueryState';
import DataTable from '../../components/common/DataTable';
import ProcedureCard from '../../components/staff/ProcedureCard';
import PackageCard from '../../components/staff/PackageCard';
import {
  useClinicSettings,
  useUpdateClinicSettings,
  useEmailSettings,
  useTestEmailSettings,
  useStaffProcedures,
  useCreateStaffProcedure,
  useUpdateStaffProcedure,
  useStaffProcedurePackages,
  useCreateStaffProcedurePackage,
  useUpdateStaffProcedurePackage,
} from '../../hooks/useSettings';
import { usePermission } from '../../hooks/usePermission';
import { parseApiError, formatPrice } from '../../utils/formatters';

export default function SystemSettingsPage() {
  const [tab, setTab] = useState('clinic');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [settingsDraft, setSettingsDraft] = useState({});
  const [procForm, setProcForm] = useState(null);
  const [pkgForm, setPkgForm] = useState(null);
  const [emailForm, setEmailForm] = useState({ test_email: '' });
  const { can } = usePermission();

  const settings = useClinicSettings();
  const emailSettings = useEmailSettings();
  const procedures = useStaffProcedures();
  const packages = useStaffProcedurePackages();
  const updateSettings = useUpdateClinicSettings();
  const testEmailSettings = useTestEmailSettings();
  const createProc = useCreateStaffProcedure();
  const updateProc = useUpdateStaffProcedure();
  const createPkg = useCreateStaffProcedurePackage();
  const updatePkg = useUpdateStaffProcedurePackage();

  const canManage = can('settings.manage');

  const handleSaveSettings = async () => {
    setError('');
    const payload = (settings.data || []).map((s) => ({
      key: s.key,
      value: settingsDraft[s.key] ?? s.value,
    }));
    try {
      await updateSettings.mutateAsync(payload);
      setMessage('Clinic settings saved.');
      setSettingsDraft({});
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleTestEmail = async () => {
    setError('');
    try {
      const res = await testEmailSettings.mutateAsync(
        emailForm.test_email.trim() || emailSettings.data?.smtp_user
      );
      setMessage(res.data.detail || 'Test email sent.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleSaveProcedure = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (procForm.id) {
        await updateProc.mutateAsync({ id: procForm.id, data: procForm });
      } else {
        await createProc.mutateAsync(procForm);
      }
      setMessage('Procedure saved.');
      setProcForm(null);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleDeactivateProcedure = async (procedure) => {
    if (!window.confirm(`Deactivate procedure "${procedure.name}"?`)) return;
    setError('');
    try {
      await updateProc.mutateAsync({ id: procedure.id, data: { is_active: false } });
      setMessage('Procedure deactivated.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...pkgForm,
      procedure_ids: (pkgForm.procedure_ids || []).map(Number),
      package_price: pkgForm.package_price,
    };
    try {
      if (pkgForm.id) {
        await updatePkg.mutateAsync({ id: pkgForm.id, data: payload });
      } else {
        await createPkg.mutateAsync(payload);
      }
      setMessage('Package saved.');
      setPkgForm(null);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const handleDeactivatePackage = async (pkg) => {
    if (!window.confirm(`Deactivate package "${pkg.name}"?`)) return;
    setError('');
    try {
      await updatePkg.mutateAsync({ id: pkg.id, data: { is_active: false } });
      setMessage('Package deactivated.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const togglePackageProcedure = (procId) => {
    const id = Number(procId);
    setPkgForm((prev) => {
      const ids = prev.procedure_ids || [];
      return {
        ...prev,
        procedure_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      };
    });
  };

  const procColumns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'duration_minutes', label: 'Duration (min)' },
    { key: 'price', label: 'Price', render: (r) => formatPrice(r.price) },
    {
      key: 'active',
      label: 'Active',
      render: (r) => (r.is_active ? 'Yes' : 'No'),
    },
    ...(canManage
      ? [
          {
            key: 'actions',
            label: '',
            render: (r) => (
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-outline btn-sm" onClick={() => setProcForm({ ...r })}>
                  Edit
                </button>
                {r.is_active && (
                  <button
                    type="button"
                    className="btn-danger btn-sm"
                    onClick={() => handleDeactivateProcedure(r)}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" subtitle="Clinic configuration and procedures" />

      {message && <AlertBanner message={message} onDismiss={() => setMessage('')} />}
      <ErrorMessage message={error} />

      <div className="flex flex-wrap gap-2">
        {['clinic', 'email', 'procedures', 'packages'].map((t) => (
          <button
            key={t}
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'bg-sky-600 text-white' : 'bg-white text-slate-600'
            }`}
            onClick={() => {
              setTab(t);
              if (t === 'email' && emailSettings.data && !emailForm.test_email) {
                setEmailForm((f) => ({
                  ...f,
                  test_email: emailSettings.data.smtp_user || '',
                }));
              }
            }}
          >
            {t === 'email' ? 'Email (Gmail)' : t}
          </button>
        ))}
      </div>

      {tab === 'clinic' && (
        <QueryState isLoading={settings.isLoading} isError={settings.isError} error={settings.error}>
          <div className="card space-y-4">
            {(settings.data || []).map((s) => (
              <label key={s.key} className="label block">
                {s.key.replace(/_/g, ' ')}
                <input
                  className="input max-w-md"
                  value={settingsDraft[s.key] ?? s.value}
                  onChange={(e) => setSettingsDraft((d) => ({ ...d, [s.key]: e.target.value }))}
                  disabled={!canManage}
                />
                {s.description && <span className="mt-1 block text-xs text-slate-400">{s.description}</span>}
              </label>
            ))}
            {canManage && (
              <button type="button" className="btn-primary btn-sm" onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                Save settings
              </button>
            )}
          </div>
        </QueryState>
      )}

      {tab === 'email' && (
        <QueryState isLoading={emailSettings.isLoading} isError={emailSettings.isError} error={emailSettings.error}>
          <div className="card space-y-4 max-w-lg">
            <p className="text-sm text-slate-600">
              Email is configured via server environment variables (
              <code className="text-xs">EMAIL_HOST_USER</code>,{' '}
              <code className="text-xs">EMAIL_HOST_PASSWORD</code>). See{' '}
              <code className="text-xs">DEPLOYMENT.md</code> on Render/Vercel.
            </p>
            {emailSettings.data?.smtp_ready ? (
              <p className="text-sm font-medium text-emerald-700">
                SMTP ready — sender: {emailSettings.data.smtp_user || 'configured'}
              </p>
            ) : (
              <p className="text-sm font-medium text-amber-700">
                {emailSettings.data?.setup_hint || 'SMTP is not configured yet.'}
              </p>
            )}
            {canManage && (
              <div className="space-y-3">
                <label className="label">
                  Send test email to
                  <input
                    type="email"
                    className="input"
                    placeholder={emailSettings.data?.smtp_user || 'recipient@example.com'}
                    value={emailForm.test_email}
                    onChange={(e) => setEmailForm((f) => ({ ...f, test_email: e.target.value }))}
                  />
                </label>
                <button
                  type="button"
                  className="btn-outline btn-sm"
                  onClick={handleTestEmail}
                  disabled={testEmailSettings.isPending || !emailSettings.data?.smtp_ready}
                >
                  Send test email
                </button>
              </div>
            )}
          </div>
        </QueryState>
      )}

      {tab === 'procedures' && (
        <>
          {canManage && (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() =>
                setProcForm({
                  name: '',
                  slug: '',
                  category: 'minor',
                  duration_minutes: 30,
                  price: '0',
                  is_active: true,
                })
              }
            >
              + Add procedure
            </button>
          )}
          {procForm && (
            <form onSubmit={handleSaveProcedure} className="card grid gap-4 sm:grid-cols-2">
              {['name', 'slug', 'category', 'duration_minutes', 'price'].map((f) => (
                <label key={f} className="label capitalize">
                  {f.replace('_', ' ')}
                  <input
                    className="input"
                    type={f === 'duration_minutes' || f === 'price' ? 'number' : 'text'}
                    value={procForm[f]}
                    onChange={(e) => setProcForm((p) => ({ ...p, [f]: e.target.value }))}
                    required={f !== 'slug'}
                  />
                </label>
              ))}
              <div className="flex gap-2 sm:col-span-2">
                <button type="submit" className="btn-primary btn-sm">Save</button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setProcForm(null)}>Cancel</button>
              </div>
            </form>
          )}
          <QueryState isLoading={procedures.isLoading} isError={procedures.isError} error={procedures.error}>
            <DataTable
              columns={procColumns}
              rows={procedures.data || []}
              renderMobileCard={(r) => (
                <ProcedureCard
                  procedure={r}
                  canManage={canManage}
                  onEdit={setProcForm}
                  onDeactivate={handleDeactivateProcedure}
                />
              )}
            />
          </QueryState>
        </>
      )}

      {tab === 'packages' && (
        <>
          {canManage && (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() =>
                setPkgForm({
                  name: '',
                  slug: '',
                  description: '',
                  package_price: '0',
                  procedure_ids: [],
                  is_active: true,
                })
              }
            >
              + Add package
            </button>
          )}
          {pkgForm && (
            <form onSubmit={handleSavePackage} className="card space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {['name', 'slug', 'package_price'].map((f) => (
                  <label key={f} className="label capitalize">
                    {f.replace('_', ' ')}
                    <input
                      className="input"
                      type={f === 'package_price' ? 'number' : 'text'}
                      value={pkgForm[f]}
                      onChange={(e) => setPkgForm((p) => ({ ...p, [f]: e.target.value }))}
                      required={f !== 'slug'}
                    />
                  </label>
                ))}
                <label className="label sm:col-span-2">
                  Description
                  <textarea
                    className="input"
                    value={pkgForm.description}
                    onChange={(e) => setPkgForm((p) => ({ ...p, description: e.target.value }))}
                    rows={2}
                  />
                </label>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Included procedures</p>
                <div className="flex flex-wrap gap-2">
                  {(procedures.data || [])
                    .filter((p) => p.is_active)
                    .map((proc) => {
                      const selected = (pkgForm.procedure_ids || []).includes(Number(proc.id));
                      return (
                        <button
                          key={proc.id}
                          type="button"
                          className={`rounded-lg border px-3 py-1 text-sm ${
                            selected
                              ? 'border-violet-500 bg-violet-50 text-violet-900'
                              : 'border-slate-200 bg-white'
                          }`}
                          onClick={() => togglePackageProcedure(proc.id)}
                        >
                          {selected ? '✓' : '+'} {proc.name}
                        </button>
                      );
                    })}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary btn-sm">Save</button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setPkgForm(null)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
          <QueryState isLoading={packages.isLoading} isError={packages.isError} error={packages.error}>
            <DataTable
              columns={[
                { key: 'name', label: 'Name' },
                {
                  key: 'procedures',
                  label: 'Procedures',
                  render: (r) => (r.procedures || []).map((p) => p.name).join(', ') || '—',
                },
                { key: 'duration', label: 'Duration (min)', render: (r) => r.total_duration_minutes },
                { key: 'price', label: 'Package price', render: (r) => formatPrice(r.package_price) },
                { key: 'active', label: 'Active', render: (r) => (r.is_active ? 'Yes' : 'No') },
                ...(canManage
                  ? [
                      {
                        key: 'actions',
                        label: '',
                        render: (r) => (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn-outline btn-sm"
                              onClick={() =>
                                setPkgForm({
                                  ...r,
                                  procedure_ids: (r.procedures || []).map((p) => p.id),
                                })
                              }
                            >
                              Edit
                            </button>
                            {r.is_active && (
                              <button
                                type="button"
                                className="btn-danger btn-sm"
                                onClick={() => handleDeactivatePackage(r)}
                              >
                                Deactivate
                              </button>
                            )}
                          </div>
                        ),
                      },
                    ]
                  : []),
              ]}
              rows={packages.data || []}
              emptyMessage="No packages defined."
              renderMobileCard={(r) => (
                <PackageCard
                  package={r}
                  canManage={canManage}
                  onEdit={(pkg) =>
                    setPkgForm({
                      ...pkg,
                      procedure_ids: (pkg.procedures || []).map((p) => p.id),
                    })
                  }
                  onDeactivate={handleDeactivatePackage}
                />
              )}
            />
          </QueryState>
        </>
      )}
    </div>
  );
}
