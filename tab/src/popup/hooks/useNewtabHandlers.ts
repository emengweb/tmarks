/**
 * NewTab 模式事件处理 Hook
 */

import type { PageInfo } from '@/types';
import type { StorageConfig } from '@/types/config';
import type { NewtabFolder, NewtabSuggestion } from './useNewtabState';
import { sendMessage } from '@/lib/utils/messaging';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/i18n';

interface UseNewtabHandlersProps {
  currentPage: PageInfo | null;
  config: StorageConfig | null;
  titleOverride: string;
  newtabFoldersLoaded: boolean;
  newtabFolders: NewtabFolder[];
  newtabSuggestions: NewtabSuggestion[];
  currentNewtabFolderId: string | null;
  newtabRootId: string | null;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setLoadingMessage: (message: string | null) => void;
}

export function useNewtabHandlers({
  currentPage,
  config,
  titleOverride,
  newtabFoldersLoaded,
  newtabFolders,
  newtabSuggestions,
  currentNewtabFolderId,
  newtabRootId,
  setError,
  setSuccessMessage,
  setLoadingMessage,
}: UseNewtabHandlersProps) {
  // 判断用户是否手动选择了文件夹（不是根目录）
  const hasUserSelectedFolder = Boolean(
    currentNewtabFolderId && currentNewtabFolderId !== newtabRootId
  );

  // 获取当前保存目标路径（用于显示）
  const currentSaveTargetPath = (() => {
    if (!newtabFoldersLoaded) return 'TMarks';

    // 如果用户手动选择了文件夹，显示用户选择的
    if (hasUserSelectedFolder) {
      const folder = newtabFolders.find((f) => f.id === currentNewtabFolderId);
      return folder?.path || 'TMarks';
    }

    // 如果有 AI 推荐且未手动选择，显示 AI 推荐的第一个
    if (newtabSuggestions.length > 0) {
      return newtabSuggestions[0].path;
    }

    // 默认显示根目录
    return 'TMarks';
  })();

  const handleSaveToNewTab = async () => {
    if (!currentPage?.url) {
      setError(t('error_no_page_info'));
      return;
    }
    const finalTitle = titleOverride.trim() || currentPage.title;
    const startTime = Date.now();

    try {
      let targetFolderId: string | undefined = undefined;

      if (hasUserSelectedFolder) {
        targetFolderId = currentNewtabFolderId || undefined;
      }

      const shouldAutoRecommend =
        !hasUserSelectedFolder &&
        Boolean(
          config &&
            config.preferences.enableNewtabAI &&
            config.aiConfig.apiKeys[config.aiConfig.provider]
        );

      if (shouldAutoRecommend && newtabFoldersLoaded) {
        if (newtabSuggestions.length > 0) {
          targetFolderId = newtabSuggestions[0].id;
        }
      }

      setLoadingMessage(t('msg_saving_to_newtab'));
      await sendMessage<{ id: string }>({
        type: 'SAVE_TO_NEWTAB',
        payload: {
          url: currentPage.url,
          title: finalTitle,
          parentBookmarkId: targetFolderId,
        },
      });
      setLoadingMessage(null);

      const elapsedMs = Date.now() - startTime;
      const savedPath =
        newtabFolders.find((f) => f.id === targetFolderId)?.path || 'TMarks';
      setSuccessMessage(
        `${t('msg_saved_to', savedPath)}（${(elapsedMs / 1000).toFixed(2)}s）`
      );

      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/icons/icon-128.png',
        title: t('popup_title'),
        message: t('notification_saved', [finalTitle, savedPath]),
      });

      setTimeout(() => {
        const currentMsg = useAppStore.getState().successMessage;
        if (currentMsg?.includes(savedPath)) {
          useAppStore.getState().setSuccessMessage(null);
        }
      }, 2000);
    } catch (e) {
      setLoadingMessage(null);
      setError(e instanceof Error ? e.message : t('error_save_failed'));
    }
  };

  return {
    hasUserSelectedFolder,
    currentSaveTargetPath,
    handleSaveToNewTab,
  };
}
