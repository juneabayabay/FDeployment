import PublicBubbles from '../../public/PublicBubbles';
import PatientAuthBrand from './PatientAuthBrand';

export default function PatientAuthShell({ children, wide = false }) {
  const cardClass = [
    'public-main-card',
    'public-main-card--auth',
    'patient-auth-card',
    wide ? 'public-main-card--auth-wide' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="public-page patient-auth-page">
      <PublicBubbles />
      <div className={cardClass}>
        <PatientAuthBrand />
        {children}
      </div>
    </div>
  );
}
