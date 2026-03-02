/**
 * TMarks 书签同步 Hook
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { t } from '@/lib/i18n';
import { StorageService } from '@/lib/utils/storage';
import { createTMarksClient, type TMarks } from '@/lib/api';
import { getTMarksUrls } from '@/lib/constants/urls';
import { TMARKS_STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';
import type { TMarksBookmark, SyncState } from '../types';
import type { Message } from '@/types';

// 缓存数据结构
interface CachedPinnedBookmarks {
  bookmarks: TMarksBookmark[];
  timestamp: number;
}

// 客户端缓存（模块级别单例）
let cachedClient: TMarks | null = null;
let cachedClientConfig: { apiKey: string; apiBaseUrl: string } | null = null;

// 创建或获取缓存的 TMarks 客户端
async function getTMarksClient(): Promise<TMarks> {
  const configuredUrl = await StorageService.getBookmarkSiteApiUrl();
  const apiKey = await StorageService.getBookmarkSiteApiKey();

  if (!apiKey) {
    throw new Error('API Key not configured');
  }

  let apiBaseUrl: string;
  if (configuredUrl) {
    apiBaseUrl = configuredUrl.endsWith('/api')
      ? configuredUrl
      : getTMarksUrls(configuredUrl).API_BASE;
  } else {
    apiBaseUrl = getTMarksUrls().API_BASE;
  }

  // 检查缓存是否有效（配置未变化）
  if (
    cachedClient &&
    cachedClientConfig &&
    cachedClientConfig.apiKey === apiKey &&
    cachedClientConfig.apiBaseUrl === apiBaseUrl
  ) {
    return cachedClient;
  }

  // 创建新客户端并缓存
  cachedClient = createTMarksClient({ apiKey, baseUrl: apiBaseUrl });
  cachedClientConfig = { apiKey, apiBaseUrl };

  return cachedClient;
}

// 清除客户端缓存（配置变更时调用）
export function clearTMarksClientCache(): void {
  cachedClient = null;
  cachedClientConfig = null;
}

export function useTMarksSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncAt: null,
    error: null,
    deviceId: '',
  });
  const [pinnedBookmarks, setPinnedBookmarks] = useState<TMarksBookmark[]>([]);
  const fetchPinnedBookmarksRef = useRef<((forceRefresh?: boolean) => Promise<any>) | null>(null);

  // 从缓存加载置顶书签（永久缓存，除非主动刷新）
  const loadFromCache = useCallback(async (): Promise<TMarksBookmark[] | null> => {
    try {
      const result = await chrome.storage.local.get(TMARKS_STORAGE_KEYS.PINNED_BOOKMARKS);
      const cached = result[TMARKS_STORAGE_KEYS.PINNED_BOOKMARKS] as CachedPinnedBookmarks | undefined;

      if (cached && cached.bookmarks) {
        logger.log('Loaded pinned bookmarks from cache:', cached.bookmarks.length);
        return cached.bookmarks;
      }
      return null;
    } catch (error) {
      logger.error('Failed to load cache:', error);
      return null;
    }
  }, []);

  // 保存到缓存
  const saveToCache = useCallback(async (bookmarks: TMarksBookmark[]) => {
    try {
      const cached: CachedPinnedBookmarks = {
        bookmarks,
        timestamp: Date.now(),
      };
      await chrome.storage.local.set({ [TMARKS_STORAGE_KEYS.PINNED_BOOKMARKS]: cached });
      logger.log('Pinned bookmarks cached');
    } catch (error) {
      logger.error('Failed to save cache:', error);
    }
  }, []);

  // 获取置顶书签（优先使用缓存）
  const fetchPinnedBookmarks = useCallback(async (forceRefresh = false) => {
    // 如果不是强制刷新，先尝试从缓存加载
    if (!forceRefresh) {
      const cached = await loadFromCache();
      if (cached) {
        setPinnedBookmarks(cached);
        setSyncState({
          isSyncing: false,
          lastSyncAt: Date.now(),
          error: null,
          deviceId: '',
        });
        return cached;
      }
    }

    setSyncState((s) => ({ ...s, isSyncing: true, error: null }));

    try {
      const client = await getTMarksClient();
      const response = await client.bookmarks.getPinnedBookmarks({
        page_size: 20,
      });

      logger.debug('Fetch pinned bookmarks response:', {
        total: response.data?.bookmarks?.length,
        bookmarks: response.data?.bookmarks?.map((b) => ({
          id: b.id,
          title: b.title,
          is_pinned: b.is_pinned,
          is_pinned_type: typeof b.is_pinned,
        })),
      });

      if (response.data?.bookmarks) {
        // 标准化为 boolean 类型
        const pinnedOnly = response.data.bookmarks.filter((b) => b.is_pinned === true);
        
        logger.log('Filtered pinned bookmarks:', pinnedOnly.length, '/', response.data.bookmarks.length);

        const bookmarks: TMarksBookmark[] = pinnedOnly.map((b) => ({
          id: b.id,
          url: b.url,
          title: b.title,
          favicon: b.favicon || undefined,
          is_pinned: true,
        }));
        
        setPinnedBookmarks(bookmarks);
        await saveToCache(bookmarks);
      }

      setSyncState({
        isSyncing: false,
        lastSyncAt: Date.now(),
        error: null,
        deviceId: '',
      });

      return response.data?.bookmarks || [];
    } catch (error) {
      const message = extractErrorMessage(error, t('error_sync_failed'));
      logger.error('Fetch pinned bookmarks failed:', error);
      setSyncState((s) => ({
        ...s,
        isSyncing: false,
        error: message,
      }));
      return [];
    }
  }, [loadFromCache, saveToCache]);

  // 搜索书签
  const searchBookmarks = useCallback(async (query: string) => {
    if (!query.trim()) return [];

    try {
      const client = await getTMarksClient();
      const response = await client.bookmarks.searchBookmarks(query, {
        page_size: 10,
      });

      return (response.data?.bookmarks || []).map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title,
        favicon: b.favicon || undefined,
        tags: b.tags || [],
        description: b.description,
        click_count: b.click_count,
        is_pinned: b.is_pinned,
      }));
    } catch {
      return [];
    }
  }, []);

  // 检查是否已配置 API
  const checkApiConfigured = useCallback(async () => {
    try {
      const client = await getTMarksClient();
      await client.bookmarks.getBookmarks({ page_size: 1 });
      return true;
    } catch {
      return false;
    }
  }, []);

  // 保存 fetchPinnedBookmarks 引用
  useEffect(() => {
    fetchPinnedBookmarksRef.current = fetchPinnedBookmarks;
  }, [fetchPinnedBookmarks]);

  // 监听来自 background 的刷新消息
  useEffect(() => {
    const handleMessage = (message: Message) => {
      if (message.type === 'REFRESH_PINNED_BOOKMARKS') {
        logger.log('Received refresh pinned bookmarks message');
        // 强制从后端刷新
        if (fetchPinnedBookmarksRef.current) {
          fetchPinnedBookmarksRef.current(true);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // 重新排序置顶书签（同步到后端）
  const reorderPinnedBookmarks = useCallback(async (bookmarkIds: string[]) => {
    try {
      // 立即更新本地状态
      const reordered = bookmarkIds
        .map(id => pinnedBookmarks.find(b => b.id === id))
        .filter((b): b is TMarksBookmark => b !== undefined);
      setPinnedBookmarks(reordered);
      await saveToCache(reordered);
      
      // 异步同步到后端
      const client = await getTMarksClient();
      await client.bookmarks.reorderPinnedBookmarks(bookmarkIds);
      
      logger.log('Pinned bookmarks order updated and synced');
    } catch (error) {
      logger.error('Failed to update pinned bookmarks order:', error);
      // 失败时重新从后端获取
      await fetchPinnedBookmarks(true);
    }
  }, [pinnedBookmarks, saveToCache, fetchPinnedBookmarks]);

  // 记录书签点击（静默失败，不影响用户体验）
  const recordBookmarkClick = useCallback(async (bookmarkId: string) => {
    try {
      const client = await getTMarksClient();
      await client.bookmarks.recordClick(bookmarkId);
      logger.debug('Recorded bookmark click:', bookmarkId);
    } catch (error) {
      // 静默失败，不影响用户体验
      logger.warn('Failed to record bookmark click:', error);
    }
  }, []);

  // 记录标签点击（静默失败，不影响用户体验）
  const recordTagClick = useCallback(async (tagId: string) => {
    try {
      const client = await getTMarksClient();
      await client.tags.incrementClick(tagId);
      logger.debug('Recorded tag click:', tagId);
    } catch (error) {
      // 静默失败，不影响用户体验
      logger.warn('Failed to record tag click:', error);
    }
  }, []);

  return {
    syncState,
    pinnedBookmarks,
    fetchPinnedBookmarks,
    searchBookmarks,
    checkApiConfigured,
    reorderPinnedBookmarks,
    recordBookmarkClick,
    recordTagClick,
  };
}
