/**
 * TMarks 同步服务
 * 负责 NewTab 书签与 TMarks 服务器的同步
 */

import { createTMarksClient } from '@/lib/api';
import { StorageService } from '@/lib/utils/storage';
import { logger } from '@/lib/utils/logger';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import { t } from '@/lib/i18n';
import type { Item } from '../types/core';

export interface TMarksSyncResult {
  success: boolean;
  tmarksBookmarkId?: string;
  error?: string;
}

/**
 * 获取 TMarks 客户端（如果配置了）
 */
async function getTMarksClient() {
  try {
    const config = await StorageService.getTMarksConfig();
    if (!config?.bookmarkApiUrl || !config?.bookmarkApiKey) {
      return null;
    }
    return createTMarksClient({
      baseUrl: config.bookmarkApiUrl,
      apiKey: config.bookmarkApiKey,
    });
  } catch {
    return null;
  }
}

/**
 * 同步创建书签到 TMarks 服务器
 */
export async function syncCreateBookmarkToTMarks(
  item: Item
): Promise<TMarksSyncResult> {
  if (item.type !== 'shortcut') {
    return { success: false, error: 'Not a shortcut item' };
  }

  const data = item.data as { url: string; title: string };
  if (!data.url) {
    return { success: false, error: 'No URL' };
  }

  const client = await getTMarksClient();
  if (!client) {
    // 未配置 TMarks，静默跳过
    return { success: true };
  }

  try {
    const response = await client.bookmarks.createBookmark({
      title: data.title,
      url: data.url,
      tags: [], // 可以后续添加标签支持
    });

    if (!response?.data?.bookmark?.id) {
      throw new Error('Invalid response: missing bookmark id');
    }

    return {
      success: true,
      tmarksBookmarkId: response.data.bookmark.id,
    };
  } catch (error) {
    logger.error('[TMarks Sync] Create bookmark failed:', error);
    return {
      success: false,
      error: extractErrorMessage(error, t('error_sync_failed')),
    };
  }
}

/**
 * 同步删除书签到 TMarks 服务器（移入回收站）
 */
export async function syncTrashBookmarkToTMarks(
  tmarksBookmarkId: string
): Promise<TMarksSyncResult> {
  if (!tmarksBookmarkId) {
    return { success: true }; // 没有关联的 TMarks 书签，跳过
  }

  const client = await getTMarksClient();
  if (!client) {
    return { success: true }; // 未配置 TMarks，静默跳过
  }

  try {
    await client.bookmarks.trashBookmark(tmarksBookmarkId);
    return { success: true };
  } catch (error) {
    logger.error('[TMarks Sync] Delete bookmark failed:', error);
    return {
      success: false,
      error: extractErrorMessage(error, t('error_sync_delete_failed')),
    };
  }
}

/**
 * 批量同步删除书签到 TMarks 服务器
 */
export async function syncTrashBookmarksToTMarks(
  tmarksBookmarkIds: string[]
): Promise<TMarksSyncResult> {
  if (tmarksBookmarkIds.length === 0) {
    return { success: true };
  }

  const client = await getTMarksClient();
  if (!client) {
    return { success: true };
  }

  const errors: string[] = [];
  for (const id of tmarksBookmarkIds) {
    try {
      await client.bookmarks.trashBookmark(id);
    } catch (error) {
      errors.push(`${id}: ${extractErrorMessage(error, t('error_unknown'))}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: t('error_partial_delete', errors.join(', ')),
    };
  }

  return { success: true };
}

/**
 * 同步更新书签到 TMarks 服务器
 */
export async function syncUpdateBookmarkToTMarks(
  tmarksBookmarkId: string,
  updates: { title?: string; url?: string }
): Promise<TMarksSyncResult> {
  if (!tmarksBookmarkId) {
    return { success: true };
  }

  const client = await getTMarksClient();
  if (!client) {
    return { success: true };
  }

  try {
    await client.bookmarks.updateBookmark(tmarksBookmarkId, updates);
    return { success: true };
  } catch (error) {
    logger.error('[TMarks Sync] Update bookmark failed:', error);
    return {
      success: false,
      error: extractErrorMessage(error, t('error_sync_update_failed')),
    };
  }
}
