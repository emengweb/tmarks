/**
 * Popup 通知栏（错误、成功、加载消息）
 */

import { ErrorMessage } from '@/components/ErrorMessage';
import { SuccessMessage } from '@/components/SuccessMessage';
import { LoadingMessage } from '@/components/LoadingMessage';

interface NotificationBarProps {
  error: string | null;
  successMessage: string | null;
  loadingMessage: string | null;
  lastRecommendationSource?: string;
  onDismissError: () => void;
  onDismissSuccess: () => void;
  onRetry?: () => void;
}

export function NotificationBar({
  error,
  successMessage,
  loadingMessage,
  lastRecommendationSource,
  onDismissError,
  onDismissSuccess,
  onRetry,
}: NotificationBarProps) {
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 space-y-2 px-4 pt-2">
      {error && (
        <div className="pointer-events-auto">
          <ErrorMessage
            message={error}
            onDismiss={onDismissError}
            onRetry={lastRecommendationSource === 'fallback' ? onRetry : undefined}
          />
        </div>
      )}
      {loadingMessage && (
        <div className="pointer-events-auto">
          <LoadingMessage message={loadingMessage} />
        </div>
      )}
      {successMessage && (
        <div className="pointer-events-auto">
          <SuccessMessage message={successMessage} onDismiss={onDismissSuccess} />
        </div>
      )}
    </div>
  );
}
