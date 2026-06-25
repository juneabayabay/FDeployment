import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { getUnauthenticatedLoginPath } from '../utils/storage';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage label="Checking session..." />;
  }

  if (!isAuthenticated) {
    const loginPath = getUnauthenticatedLoginPath(location.pathname);
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
