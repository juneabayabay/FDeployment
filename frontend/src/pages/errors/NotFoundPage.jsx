import { Link, useLocation } from 'react-router-dom';

export default function NotFoundPage() {
  const { pathname } = useLocation();
  const looksLikePatientTypo = pathname.startsWith('/patien');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <p className="mt-4 text-lg text-clinic-body">Page not found</p>
      <p className="mt-2 font-mono text-sm text-clinic-muted">{pathname}</p>
      {looksLikePatientTypo && (
        <p className="mt-3 max-w-md text-sm text-amber-700">
          Did you mean <strong>/patient</strong> (with a &quot;t&quot;)? Patient login is at{' '}
          <Link to="/login" className="text-clinic-500 underline">/login</Link> — dashboard is{' '}
          <Link to="/patient/dashboard" className="text-clinic-500 underline">/patient/dashboard</Link>.
        </p>
      )}
      <Link to="/login" className="btn-primary mt-6">Patient login</Link>
    </div>
  );
}
