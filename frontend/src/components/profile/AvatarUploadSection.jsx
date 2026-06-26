import { useEffect, useRef, useState } from 'react';
import { authService } from '../../services';
import { parseApiError } from '../../utils/formatters';
import { AVATAR_ACCEPT, validateAvatarFile } from '../../utils/avatar';
import Avatar from '../common/Avatar';

export default function AvatarUploadSection({ user, onUpdated, onError, onMessage }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayUser = previewUrl
    ? { ...user, avatar_url: previewUrl }
    : user;

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const validationError = validateAvatarFile(file);
    if (validationError) {
      onError(validationError);
      return;
    }

    onError('');
    onMessage('');

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
      return localPreview;
    });

    setUploading(true);
    try {
      const { data } = await authService.uploadAvatar(file);
      setPreviewUrl(null);
      await onUpdated();
      onMessage('Profile picture updated.');
    } catch (err) {
      setPreviewUrl(null);
      onError(parseApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    onError('');
    onMessage('');
    setUploading(true);
    try {
      const { data } = await authService.deleteAvatar();
      setPreviewUrl(null);
      await onUpdated();
      onMessage('Profile picture removed.');
    } catch (err) {
      onError(parseApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const hasCustomAvatar = Boolean(user?.avatar_url);

  return (
    <div className="card flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <Avatar user={displayUser} size="xl" />
      <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
        <div>
          <h3 className="font-semibold text-slate-900">Profile picture</h3>
          <p className="text-sm text-slate-500">
            JPG, PNG, or WebP. Max 5 MB.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <input
            ref={inputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            className="btn-primary btn-sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
          {hasCustomAvatar && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              disabled={uploading}
              onClick={handleRemove}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
