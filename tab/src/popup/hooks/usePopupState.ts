/**
 * Popup 状态管理 Hook
 */

import { useState, useEffect } from 'react';

export type ViewMode = 'selector' | 'bookmark' | 'newtab' | 'tabCollection';

export function usePopupState() {
  const [customTagInput, setCustomTagInput] = useState('');
  const [titleOverride, setTitleOverride] = useState('');
  const [descriptionOverride, setDescriptionOverride] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('selector');
  const [showTitleEdit, setShowTitleEdit] = useState(false);
  const [showDescEdit, setShowDescEdit] = useState(false);

  return {
    customTagInput,
    setCustomTagInput,
    titleOverride,
    setTitleOverride,
    descriptionOverride,
    setDescriptionOverride,
    initialized,
    setInitialized,
    viewMode,
    setViewMode,
    showTitleEdit,
    setShowTitleEdit,
    showDescEdit,
    setShowDescEdit,
  };
}

/**
 * 同步标题覆盖值
 */
export function useTitleSync(currentPageTitle: string | undefined, setTitleOverride: (value: string) => void) {
  useEffect(() => {
    setTitleOverride(currentPageTitle ?? '');
  }, [currentPageTitle, setTitleOverride]);
}

/**
 * 同步描述覆盖值
 */
export function useDescriptionSync(currentPageDescription: string | undefined, setDescriptionOverride: (value: string) => void) {
  useEffect(() => {
    setDescriptionOverride(currentPageDescription ?? '');
  }, [currentPageDescription, setDescriptionOverride]);
}
