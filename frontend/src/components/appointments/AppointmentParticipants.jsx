import Avatar from '../common/Avatar';
import { ROLES } from '../../utils/constants';

function participantUser(person, fallbackRole) {
  if (!person) return null;
  return {
    ...person,
    role_slugs: person.role_slugs?.length ? person.role_slugs : [fallbackRole],
  };
}

function Participant({ label, person, role }) {
  const user = participantUser(person, role);
  if (!user) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs">
          —
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p>Not assigned</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar user={user} size="sm" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-800">{user.full_name || user.email}</p>
      </div>
    </div>
  );
}

export default function AppointmentParticipants({
  patient,
  dentist,
  showPatient = true,
  showDentist = true,
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {showDentist && dentist && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Avatar user={participantUser(dentist, ROLES.DENTIST)} size="sm" />
            <span>{dentist.full_name}</span>
          </div>
        )}
        {showPatient && patient && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Avatar user={participantUser(patient, ROLES.USER)} size="sm" />
            <span>{patient.full_name}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {showPatient && <Participant label="Patient" person={patient} role={ROLES.USER} />}
      {showDentist && <Participant label="Dentist" person={dentist} role={ROLES.DENTIST} />}
    </div>
  );
}
