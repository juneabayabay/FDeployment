import { Navigate, useLocation } from 'react-router-dom';

/** Redirects /patien/* → /patient/* (common typo). */
export default function PatientTypoRedirect() {
  const { pathname, search, hash } = useLocation();
  const fixed = pathname.replace(/^\/patien(?=\/|$)/, '/patient') + search + hash;
  return <Navigate to={fixed} replace />;
}
