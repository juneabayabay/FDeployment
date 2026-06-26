import Avatar from '../common/Avatar';
import { ROLES } from '../../utils/constants';

export default function DentistCard({
  dentist,
  selected = false,
  onSelect,
  compact = false,
}) {
  const userLike = {
    first_name: dentist.first_name,
    last_name: dentist.last_name,
    full_name: dentist.full_name,
    email: dentist.email,
    avatar_url: dentist.avatar_url,
    role_slugs: [ROLES.DENTIST],
  };

  const content = (
    <>
      <Avatar user={userLike} size={compact ? 'md' : 'lg'} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">{dentist.display_name}</p>
        {dentist.specialization && (
          <p className="truncate text-sm text-violet-700">{dentist.specialization}</p>
        )}
        {!compact && dentist.years_experience > 0 && (
          <p className="text-xs text-slate-500">{dentist.years_experience} years experience</p>
        )}
        {!compact && dentist.schedule_summary && (
          <p className="mt-1 text-xs text-slate-600">{dentist.schedule_summary}</p>
        )}
        {!compact && dentist.bio && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{dentist.bio}</p>
        )}
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(dentist)}
        className={`flex w-full gap-4 rounded-xl border p-4 text-left transition ${
          selected
            ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
            : 'border-slate-200 bg-white hover:border-sky-300 hover:bg-slate-50'
        }`}
      >
        {content}
      </button>
    );
  }

  return (
    <article className="card flex gap-4">
      {content}
    </article>
  );
}
