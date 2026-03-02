/**
 * BookmarkExistsDialog 事件处理 Hook
 */

import { t } from '@/lib/i18n';
import { TIMEOUTS } from '@/lib/constants/timeouts';

interface UseBookmarkExistsHandlersProps {
  selectedAction: 'snapshot' | 'update-tags' | 'update-description' | null;
  descriptionInput: string;
  newTags: string[];
  setIsProcessing: (processing: boolean) => void;
  setProcessingMessage: (message: string) => void;
  setIsVisible: (visible: boolean) => void;
  onUpdateTags: (tags: string[]) => Promise<void>;
  onUpdateDescription: (description: string) => Promise<void>;
  onCreateSnapshot: () => Promise<void>;
  onCancel: () => void;
}

export function useBookmarkExistsHandlers({
  selectedAction,
  descriptionInput,
  newTags,
  setIsProcessing,
  setProcessingMessage,
  setIsVisible,
  onUpdateTags,
  onUpdateDescription,
  onCreateSnapshot,
  onCancel,
}: UseBookmarkExistsHandlersProps) {
  const handleConfirm = async () => {
    if (selectedAction === 'snapshot') {
      setIsProcessing(true);
      setProcessingMessage(t('msg_capturing'));
      
      try {
        await onCreateSnapshot();
        setProcessingMessage(t('msg_snapshot_success'));
        
        setTimeout(() => {
          setIsProcessing(false);
          onCancel();
        }, 1500);
      } catch (error) {
        setProcessingMessage(t('msg_snapshot_failed'));
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    } else if (selectedAction === 'update-tags') {
      setIsProcessing(true);
      setProcessingMessage(t('msg_updating_tags'));
      
      try {
        await onUpdateTags(newTags);
        setProcessingMessage(t('msg_tags_success'));
        
        setTimeout(() => {
          setIsProcessing(false);
          onCancel();
        }, 1500);
      } catch (error) {
        setProcessingMessage(t('msg_tags_failed'));
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    } else if (selectedAction === 'update-description') {
      setIsProcessing(true);
      setProcessingMessage(t('msg_updating_desc'));
      
      try {
        await onUpdateDescription(descriptionInput.trim());
        setProcessingMessage(t('msg_desc_success'));
        
        setTimeout(() => {
          setIsProcessing(false);
          onCancel();
        }, 1500);
      } catch (error) {
        setProcessingMessage(t('msg_desc_failed'));
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onCancel, TIMEOUTS.ANIMATION);
  };

  return {
    handleConfirm,
    handleClose,
  };
}
