/**
 * 书签模式事件处理 Hook
 */

import type { PageInfo } from '@/types';
import { t } from '@/lib/i18n';

interface UseBookmarkHandlersProps {
  currentPage: PageInfo | null;
  selectedTags: string[];
  titleOverride: string;
  descriptionOverride: string;
  includeThumbnail: boolean;
  createSnapshot: boolean;
  setError: (error: string | null) => void;
  setCurrentPage: (page: PageInfo) => void;
  setTitleOverride: (value: string) => void;
  setDescriptionOverride: (value: string) => void;
  setIncludeThumbnail: (value: boolean) => void;
  setCreateSnapshot: (value: boolean) => void;
  saveBookmark: () => Promise<void>;
  addCustomTag: (tag: string) => void;
  toggleTag: (tag: string) => void;
}

export function useBookmarkHandlers({
  currentPage,
  selectedTags,
  titleOverride,
  descriptionOverride,
  includeThumbnail,
  createSnapshot,
  setError,
  setCurrentPage,
  setTitleOverride,
  setDescriptionOverride,
  setIncludeThumbnail,
  setCreateSnapshot,
  saveBookmark,
  addCustomTag,
}: UseBookmarkHandlersProps) {
  const handleSave = async () => {
    if (selectedTags.length === 0) {
      setError(t('error_select_tag'));
      return;
    }
    await saveBookmark();
  };

  const handleAddCustomTag = (customTagInput: string, setCustomTagInput: (value: string) => void) => {
    const tagName = customTagInput.trim();
    if (tagName) {
      addCustomTag(tagName);
      setCustomTagInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, customTagInput: string, setCustomTagInput: (value: string) => void) => {
    if (e.key === 'Enter') {
      handleAddCustomTag(customTagInput, setCustomTagInput);
    }
  };

  const handleApplyTitleOverride = () => {
    const trimmed = titleOverride.trim();
    if (!trimmed || !currentPage) return;
    setCurrentPage({ ...currentPage, title: trimmed });
    setTitleOverride(trimmed);
  };

  const handleApplyDescriptionOverride = () => {
    if (!currentPage) return;
    const trimmed = descriptionOverride.trim();
    setCurrentPage({ ...currentPage, description: trimmed || undefined });
    setDescriptionOverride(trimmed);
  };

  const handleToggleThumbnail = () => {
    if (!currentPage?.thumbnail) {
      setIncludeThumbnail(false);
      return;
    }
    setIncludeThumbnail(!includeThumbnail);
  };

  const handleToggleSnapshot = () => {
    setCreateSnapshot(!createSnapshot);
  };

  const handleThumbnailChange = (newThumbnail: string) => {
    if (!currentPage) return;
    setCurrentPage({ ...currentPage, thumbnail: newThumbnail });
  };

  return {
    handleSave,
    handleAddCustomTag,
    handleKeyPress,
    handleApplyTitleOverride,
    handleApplyDescriptionOverride,
    handleToggleThumbnail,
    handleToggleSnapshot,
    handleThumbnailChange,
  };
}
