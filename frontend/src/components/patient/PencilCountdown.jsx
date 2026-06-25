import { useEffect, useState } from 'react';
import { formatDateTime } from '../../utils/formatters';

export default function PencilCountdown({ expiresAt }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expiresAt) return undefined;

    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Expired');
        return;
      }
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      setRemaining(hrs > 0 ? `${hrs}h ${mins}m left` : `${mins}m left`);
    };

    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!expiresAt) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
      ⏳ Pencil hold · {remaining || formatDateTime(expiresAt)}
    </span>
  );
}
