/**
 * Background service worker for Chrome Extension
 * 主入口文件 - 负责消息监听和事件处理
 */

import { initI18n } from '@/lib/i18n';
import { cacheManager } from '@/lib/services/cache-manager';
import { tagRecommender } from '@/lib/services/tag-recommender';
import { bookmarkService } from '@/lib/services/bookmark-service';
import { bookmarkAPI } from '@/lib/services/bookmark-api';
import { syncPendingTabGroups } from '@/lib/services/tab-collection';
import { StorageService } from '@/lib/utils/storage';
import { TIMEOUTS } from '@/lib/constants/timeouts';
import type { Message, MessageResponse, PageInfo } from '@/types';
import type { BookmarkInput } from '@/types/bookmark';
import { logger } from '@/lib/utils/logger';

import {
  ensureNewtabWorkspaceFolders,
  handleBookmarkNodeRemoved,
  handleBookmarkNodeMoved,
} from './services/newtab-folder';
import { handleExtractPageInfo } from './handlers/page-info';
import {
  handleSaveToNewtab,
  handleImportAllBookmarksToNewtab,
  handleGetNewtabFolders,
  handleImportUrlsToNewtab,
} from './handlers/newtab-folders';
import { handleRecommendNewtabFolder } from './handlers/ai-recommend';

// 初始化 i18n（Service Worker 启动时）
initI18n().catch((error) => {
  logger.error('[Background] Failed to initialize i18n:', error);
});

// 确保 Service Worker 启动时就检查一次
ensureNewtabWorkspaceFolders().catch((error) => {
  logger.error('[Background] Failed to ensure newtab workspace folders:', error);
});

// Preload AI context
tagRecommender.preloadContext().catch((error) => {
  logger.error('[Background] Failed to preload AI context:', error);
});

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // First time install
  } else if (details.reason === 'update') {
    // Extension updated
  }
  ensureNewtabWorkspaceFolders().catch((error) => {
    logger.error('[Background] Failed to ensure newtab workspace folders on install:', error);
  });
});

chrome.runtime.onStartup.addListener(() => {
  ensureNewtabWorkspaceFolders().catch((error) => {
    logger.error('[Background] Failed to ensure newtab workspace folders on startup:', error);
  });
});

chrome.bookmarks.onRemoved.addListener((id) => {
  handleBookmarkNodeRemoved(id).catch((error) => {
    logger.error('[Background] Failed to handle bookmark removed:', id, error);
  });
});

chrome.bookmarks.onMoved.addListener((id) => {
  handleBookmarkNodeMoved(id).catch((error) => {
    logger.error('[Background] Failed to handle bookmark moved:', id, error);
  });
});

// Auto-sync cache periodically
function getMsUntilNextDailySync(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(23, 0, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

async function runAutoSync() {
  try {
    const config = await StorageService.loadConfig();
    if (!config.preferences.autoSync) {
      return;
    }
    await cacheManager.autoSync(config.preferences.syncInterval);
  } catch (error) {
    logger.error('[Background] Auto-sync failed:', error);
  }
}

async function startAutoSync() {
  const scheduleNext = () => {
    const delay = getMsUntilNextDailySync();
    setTimeout(async () => {
      await runAutoSync();
      scheduleNext();
    }, delay);
  };
  scheduleNext();
}

startAutoSync().catch((error) => {
  logger.error('[Background] Failed to start auto-sync:', error);
});

// Sync pending bookmarks on startup
bookmarkService.syncPendingBookmarks().catch((error) => {
  logger.error('[Background] Failed to sync pending bookmarks:', error);
});

// Sync pending tab groups on startup
(async () => {
  try {
    const config = await StorageService.loadConfig();
    if (config.bookmarkSite.apiKey) {
      await syncPendingTabGroups(config.bookmarkSite);
    }
  } catch (error) {
    logger.error('[Background] Failed to sync pending tab groups:', error);
  }
})();

// 定时刷新置顶书签
async function refreshPinnedBookmarksCache() {
  try {
    logger.log('[Background] 开始刷新置顶书签缓存');
    await chrome.storage.local.remove('tmarks_pinned_bookmarks_cache');
    await chrome.runtime
      .sendMessage({
        type: 'REFRESH_PINNED_BOOKMARKS',
        payload: { timestamp: Date.now(), source: 'scheduled' },
      })
      .catch((error) => {
        logger.error('[Background] Failed to send refresh message:', error);
      });
    logger.log('[Background] 置顶书签缓存刷新完成');
  } catch (error) {
    logger.error('[Background] 刷新置顶书签缓存失败:', error);
  }
}

function getMsUntilNextRefresh(refreshTime: 'morning' | 'evening'): number {
  const now = new Date();
  const target = new Date(now);
  if (refreshTime === 'morning') {
    target.setHours(8, 0, 0, 0);
  } else {
    target.setHours(22, 0, 0, 0);
  }
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.getTime() - now.getTime();
}

async function startPinnedBookmarksAutoRefresh() {
  const scheduleNext = async () => {
    try {
      const result = await chrome.storage.local.get('newtab');
      interface NewtabData {
        settings?: {
          autoRefreshPinnedBookmarks?: boolean;
          pinnedBookmarksRefreshTime?: 'morning' | 'evening';
        };
      }
      const newtabData = result.newtab as NewtabData | undefined;
      if (!newtabData?.settings?.autoRefreshPinnedBookmarks) {
        setTimeout(scheduleNext, 60 * 60 * 1000);
        return;
      }
      const refreshTime = newtabData.settings.pinnedBookmarksRefreshTime || 'morning';
      const delay = getMsUntilNextRefresh(refreshTime);
      logger.log(
        `[Background] 下次置顶书签刷新时间: ${refreshTime === 'morning' ? '早上 8:00' : '晚上 22:00'}, 距离: ${Math.round(delay / 1000 / 60)} 分钟`
      );
      setTimeout(async () => {
        await refreshPinnedBookmarksCache();
        scheduleNext();
      }, delay);
    } catch (error) {
      logger.error('[Background] Failed to schedule pinned bookmarks refresh:', error);
      setTimeout(scheduleNext, 60 * 60 * 1000);
    }
  };
  scheduleNext();
}

startPinnedBookmarksAutoRefresh().catch((error) => {
  logger.error('[Background] Failed to start pinned bookmarks auto-refresh:', error);
});

logger.log('[BG] init', {
  runtimeId: chrome.runtime.id,
  loadedAt: new Date().toISOString(),
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    try {
      logger.log('[BG] onMessage', {
        runtimeId: chrome.runtime.id,
        senderId: sender?.id,
        senderUrl: sender?.url,
        rawType: (message as Message)?.type,
      });
    } catch {
      // ignore
    }

    handleMessage(message, sender)
      .then((response) => sendResponse(response))
      .catch((error) => {
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

    return true;
  }
);

/**
 * Handle messages from popup/content scripts
 */
async function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender
): Promise<MessageResponse> {
  const type = String((message as Message)?.type ?? '')
    .trim()
    .toUpperCase();

  switch (type) {
    case 'EXTRACT_PAGE_INFO':
      return handleExtractPageInfo(message);

    case 'RECOMMEND_TAGS': {
      const pageInfo = message.payload as PageInfo;
      const result = await tagRecommender.recommendTags(pageInfo);
      return { success: true, data: result };
    }

    case 'SAVE_BOOKMARK': {
      const bookmark = message.payload as BookmarkInput;
      const result = await bookmarkService.saveBookmark(bookmark);
      return { success: true, data: result };
    }


    case 'SAVE_TO_NEWTAB':
      return handleSaveToNewtab(message);

    case 'IMPORT_ALL_BOOKMARKS_TO_NEWTAB':
      return handleImportAllBookmarksToNewtab();

    case 'IMPORT_URLS_TO_NEWTAB':
      return handleImportUrlsToNewtab(message);

    case 'GET_NEWTAB_FOLDER':
    case 'GET_NEWTAB_FOLDERS':
      return handleGetNewtabFolders();

    case 'RECOMMEND_NEWTAB_FOLDER':
      return handleRecommendNewtabFolder(message, sender);

    case 'SYNC_CACHE': {
      const result = await cacheManager.fullSync();
      return { success: result.success, data: result, error: result.error };
    }

    case 'GET_EXISTING_TAGS': {
      try {
        const tags = await bookmarkAPI.getTags();
        return { success: true, data: tags };
      } catch (error) {
        console.error('Failed to get existing tags:', error);
        return { success: true, data: [] };
      }
    }

    case 'UPDATE_BOOKMARK_TAGS': {
      const payload = message.payload as { bookmarkId: string; tags: string[] };
      await bookmarkAPI.updateBookmarkTags(payload.bookmarkId, payload.tags);
      return { success: true, data: { message: 'Tags updated successfully' } };
    }

    case 'UPDATE_BOOKMARK_DESCRIPTION': {
      const payload = message.payload as { bookmarkId: string; description: string };
      await bookmarkAPI.updateBookmarkDescription(payload.bookmarkId, payload.description);
      return { success: true, data: { message: 'Description updated successfully' } };
    }

    case 'REFRESH_PINNED_BOOKMARKS': {
      const tabs = await chrome.tabs.query({
        url: chrome.runtime.getURL('src/newtab/index.html'),
      });
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, {
              type: 'REFRESH_PINNED_BOOKMARKS',
              payload: message.payload,
            })
            .catch((error) => {
              logger.error('[Background] Failed to send refresh message to tab:', tab.id, error);
            });
        }
      }
      return { success: true, data: { message: 'Pinned bookmarks refresh triggered' } };
    }

    case 'CREATE_SNAPSHOT': {
      const payload = message.payload as { bookmarkId: string; title: string; url: string };
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      const capturePromise = chrome.tabs.sendMessage(tab.id, {
        type: 'CAPTURE_PAGE_V2',
        options: {
          inlineCSS: true,
          extractImages: true,
          inlineFonts: false,
          removeScripts: true,
          removeHiddenElements: false,
          maxImageSize: 100 * 1024 * 1024,
          timeout: 30000,
        },
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Capture timeout')), TIMEOUTS.AI_RECOMMEND);
      });

      interface CaptureResponse {
        success: boolean;
        error?: string;
        data?: {
          html: string;
          images: Array<{
            hash: string;
            data: string;
            type: string;
            size: number;
          }>;
        };
      }

      const response = (await Promise.race([capturePromise, timeoutPromise])) as CaptureResponse;

      if (!response.success) {
        throw new Error(response.error || 'Capture failed');
      }

      const captureResult = response.data!;
      const images = captureResult.images.map((img) => ({
        hash: img.hash,
        data: img.data,
        type: img.type,
      }));

      await bookmarkAPI.createSnapshotV2(payload.bookmarkId, {
        html_content: captureResult.html,
        title: payload.title,
        url: payload.url,
        images,
      });

      return {
        success: true,
        data: { message: 'Snapshot created successfully (V2)', imageCount: images.length },
      };
    }

    case 'GET_CONFIG': {
      const config = await StorageService.loadConfig();
      return { success: true, data: config };
    }

    default:
      throw new Error(
        `Unknown message type: ${type || '(empty)'} (runtimeId=${chrome.runtime.id})`
      );
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(async () => {
  // The popup will open automatically due to manifest.json configuration
});
