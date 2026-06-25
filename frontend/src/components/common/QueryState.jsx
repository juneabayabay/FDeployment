import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import { parseApiError } from '../../utils/formatters';

export default function QueryState({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
  skeleton,
  onRetry,
}) {
  if (isLoading) return skeleton || <LoadingSpinner />;

  if (isError) {
    return (
      <div className="space-y-3">
        <ErrorMessage message={parseApiError(error) || 'Something went wrong.'} />
        {onRetry && (
          <button type="button" className="btn-outline btn-sm" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
    );
  }

  return children;
}
