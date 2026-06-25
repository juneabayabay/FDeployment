import { Link, useLocation } from 'react-router-dom';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const looksLikePatientTypo = pathname.startsWith('/patien');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <p className="mt-4 text-lg text-slate-600">Page not found</p>
      <p className="mt-2 font-mono text-sm text-slate-400">{pathname}</p>
      {looksLikePatientTypo && (
        <p className="mt-3 max-w-md text-sm text-amber-700">
          Did you mean <strong>/patient</strong> (with a &quot;t&quot;)? Patient login is at{' '}
          <Link to="/" className="text-sky-600 underline">/</Link> — dashboard is{' '}
          <Link to="/patient/dashboard" className="text-sky-600 underline">/patient/dashboard</Link>.
        </p>
      )}
      <Link to="/" className="btn-primary mt-6">Patient login</Link>
    </div>
  );
}
