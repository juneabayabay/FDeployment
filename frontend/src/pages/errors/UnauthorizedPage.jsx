import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getSafeDashboardPath } from '../../utils/auth';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const dest = getSafeDashboardPath(user);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-bold text-slate-900">403</h1>
      <p className="mt-4 text-lg text-slate-600">You do not have permission to access this page.</p>
      <Link to={dest || '/'} className="btn-primary mt-6">
        {dest ? 'Go to dashboard' : 'Patient login'}
      </Link>
    </div>
  );
}
