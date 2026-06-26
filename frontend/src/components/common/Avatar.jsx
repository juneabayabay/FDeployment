import { resolveAvatarSrc } from '../../utils/avatar';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-20 w-20 text-lg',
  xl: 'h-28 w-28 text-2xl',
};

function initialsFromUser(user) {
  const first = user?.first_name?.[0] ?? '';
  const last = user?.last_name?.[0] ?? '';
  const combined = `${first}${last}`.toUpperCase();
  if (combined) return combined;
  return user?.email?.[0]?.toUpperCase() ?? '?';
}

export default function Avatar({
  user,
  src,
  size = 'md',
  className = '',
  showInitialsFallback = false,
}) {
  const resolvedSrc = resolveAvatarSrc(user, src);
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;

  if (resolvedSrc && !showInitialsFallback) {
    return (
      <img
        src={resolvedSrc}
        alt={user?.full_name ? `${user.full_name} profile` : 'Profile picture'}
        className={`rounded-full object-cover bg-slate-100 ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-700 ${sizeClass} ${className}`}
      aria-hidden={!user?.full_name}
    >
      {initialsFromUser(user)}
    </div>
  );
}
