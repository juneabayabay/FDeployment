import { Link } from 'react-router-dom';
import { APP_NAME, LOGIN_PORTALS } from '../../utils/constants';

export default function PortalHomePage() {
  const patientPortal = LOGIN_PORTALS.find((p) => p.role === 'user');
  const staffPortals = LOGIN_PORTALS.filter((p) => p.role !== 'user');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-sky-100 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            Demo
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{APP_NAME}</h1>
          <p className="mt-2 text-slate-600">Preview every login portal — pick one to open its sign-in page</p>
        </div>

        {patientPortal && (
          <Link
            to={patientPortal.path}
            className="mb-8 flex items-center gap-4 rounded-xl border border-sky-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-3xl">🦷</span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">Patient Portal</h2>
              <p className="text-sm text-slate-500">{patientPortal.description}</p>
              <p className="mt-1 font-mono text-xs text-sky-600">
                {patientPortal.path}
                {patientPortal.altPath ? ` · ${patientPortal.altPath}` : ''}
              </p>
            </div>
            <span className="text-sky-600">→</span>
          </Link>
        )}

        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">Staff login</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {staffPortals.map((portal) => (
            <Link
              key={portal.role}
              to={portal.path}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:border-sky-300 hover:shadow-md"
            >
              <h2 className="font-semibold text-slate-900">{portal.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{portal.description}</p>
              <p className="mt-2 font-mono text-xs text-sky-600">{portal.path}</p>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-600">
          New patient? <Link to="/register" className="text-sky-600 hover:text-sky-800">Register here</Link>
          {' · '}
          <Link to="/" className="text-sky-600 hover:text-sky-800">Patient login</Link>
        </p>
      </div>
    </div>
  );
}
