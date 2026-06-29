import { APP_NAME } from '../../utils/constants';

export default function PatientHero({ user, clinicInfo }) {
  const greeting = user?.first_name ? `Welcome back, ${user.first_name}` : 'Welcome to your portal';

  return (
    <div className="patient-hero">
      <p className="text-caption font-medium uppercase tracking-wide">{APP_NAME}</p>
      <h1 className="text-page-title mt-1 text-xl sm:text-2xl">{greeting}</h1>
      {clinicInfo && (
        <p className="text-body mt-2 flex flex-wrap gap-x-2 gap-y-1 text-clinic-subtle">
          <span>{clinicInfo.schedule}</span>
          {clinicInfo.lunch_break && (
            <>
              <span className="hidden sm:inline text-clinic-muted" aria-hidden="true">
                ·
              </span>
              <span>{clinicInfo.lunch_break}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
