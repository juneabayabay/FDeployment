import { Link } from 'react-router-dom';
import { APP_NAME, LOGIN_PORTALS } from '../../utils/constants';

export default function PortalHomePage() {
  const patientPortal = LOGIN_PORTALS.find((p) => p.role === 'user');
  const staffPortals = LOGIN_PORTALS.filter((p) => p.role !== 'user');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-clinic-100 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            Demo
          </span>
          <h1 className="mt-3 text-3xl font-bold text-clinic-heading">{APP_NAME}</h1>
          <p className="mt-2 text-clinic-body">Preview every login portal — pick one to open its sign-in page</p>
          <p className="mt-2 text-sm">
            <Link to="/" className="text-clinic-500 hover:text-clinic-700">← Public homepage</Link>
          </p>
        </div>

        {patientPortal && (
          <Link
            to={patientPortal.path}
            className="mb-8 flex items-center gap-4 rounded-xl border border-clinic-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-3xl">🦷</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-clinic-heading">Patient Portal</h2>
              <p className="text-sm text-clinic-subtle">{patientPortal.description}</p>
              <p className="mt-1 font-mono text-xs text-clinic-500">
                {patientPortal.path}
                {patientPortal.altPath ? ` · ${patientPortal.altPath}` : ''}
              </p>
            </div>
            <span className="text-clinic-500">→</span>
          </Link>
        )}

        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-clinic-subtle">Staff login</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {staffPortals.map((portal) => (
            <Link
              key={portal.role}
              to={portal.path}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:border-clinic-300 hover:shadow-md"
            >
              <h2 className="font-semibold text-clinic-heading">{portal.title}</h2>
              <p className="mt-1 text-sm text-clinic-subtle">{portal.description}</p>
              <p className="mt-2 font-mono text-xs text-clinic-500">{portal.path}</p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-clinic-body">
          New patient? <Link to="/register" className="text-clinic-500 hover:text-clinic-700">Register here</Link>
          {' · '}
          <Link to="/login" className="text-clinic-500 hover:text-clinic-700">Patient login</Link>
        </p>
      </div>
    </div>
  );
}
