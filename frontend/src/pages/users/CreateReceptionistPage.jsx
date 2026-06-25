import { Navigate } from 'react-router-dom';
import { useStaffPaths } from '../../hooks/useStaffPaths';

/** Legacy route — redirects to unified staff creation page. */
export default function CreateReceptionistPage() {
  const { path } = useStaffPaths();
  return <Navigate to={path('/users/create-staff?role=receptionist')} replace />;
}
