const ROLE_AVATAR_MAP = {
  dentist: '/avatars/default-dentist.svg',
  receptionist: '/avatars/default-receptionist.svg',
  admin: '/avatars/default-admin.svg',
  user: '/avatars/default-patient.svg',
};

const ROLE_PRIORITY = ['admin', 'dentist', 'receptionist', 'user'];

/**
 * Default avatar for a user based on their primary clinic role.
 */
export function getDefaultAvatarSrc(roleSlugs = []) {
  for (const slug of ROLE_PRIORITY) {
    if (roleSlugs.includes(slug)) {
      return ROLE_AVATAR_MAP[slug];
    }
  }
  return ROLE_AVATAR_MAP.user;
}

export function resolveAvatarSrc(user, explicitSrc) {
  if (explicitSrc) return explicitSrc;
  if (user?.avatar_url) return user.avatar_url;
  return getDefaultAvatarSrc(user?.role_slugs ?? []);
}

export const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export function validateAvatarFile(file) {
  if (!file) return 'Please choose an image.';
  if (file.size > AVATAR_MAX_BYTES) return 'Image must be 5 MB or smaller.';
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) return 'Only JPG, PNG, and WebP images are allowed.';
  return null;
}
