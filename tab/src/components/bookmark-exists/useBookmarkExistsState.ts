/**
 * BookmarkExistsDialog 状态管理 Hook
 */

import { useState, useEffect } from 'react';
import { StorageService } from '@/lib/utils/storage';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { useScrollLock } from '@/lib/hooks/useScrollLock';
import type { ExistingBookmarkData } from '@/lib/services/bookmark-api';

export function useBookmarkExistsState(bookmark: ExistingBookmarkData) {
  const [selectedAction, setSelectedAction] = useState<'snapshot' | 'update-tags' | 'update-description' | null>(null);
  const [tmarksUrl, setTmarksUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [descriptionInput, setDescriptionInput] = useState(bookmark.description || '');
  const [isVisible, setIsVisible] = useState(false);

  // 焦点陷阱和滚动锁定
  const dialogRef = useFocusTrap(true);
  useScrollLock(true);

  useEffect(() => {
    // Load TMarks URL from storage
    StorageService.getBookmarkSiteApiUrl().then(url => {
      if (url) {
        // Remove /api suffix if present
        const baseUrl = url.replace(/\/api$/, '');
        setTmarksUrl(baseUrl);
      }
    });

    // 淡入动画
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  return {
    selectedAction,
    setSelectedAction,
    tmarksUrl,
    isProcessing,
    setIsProcessing,
    processingMessage,
    setProcessingMessage,
    descriptionInput,
    setDescriptionInput,
    isVisible,
    setIsVisible,
    dialogRef,
  };
}
