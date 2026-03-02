import { LOCK_DURATIONS } from '@/lib/constants/durations';
import { TMARKS_STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { getStorageItem, setStorageItem } from '@/lib/utils/chromeStorage';
import { logger } from '@/lib/utils/logger';

/** TMarks 根文件夹名称 */
export const ROOT_TITLE = 'TMarks';

/** 首页文件夹名称 */
export const HOME_FOLDER_TITLE = 'NewTab Home';

/** 根文件夹 ID 存储键 */
export const STORAGE_KEY_ROOT_ID = TMARKS_STORAGE_KEYS.ROOT_BOOKMARK_ID;

/** 首页文件夹 ID 存储键 */
export const STORAGE_KEY_HOME_FOLDER_ID = TMARKS_STORAGE_KEYS.HOME_BOOKMARK_ID;

/** 写锁默认时长 (ms) */
export const WRITE_LOCK_DURATION = 1500;

/** 批量操作写锁时长 (ms) */
export const BATCH_WRITE_LOCK_DURATION = LOCK_DURATIONS.BATCH_WRITE;

/** 书签栏可能的标题 */
export const BOOKMARKS_BAR_TITLES = new Set([
  'Bookmarks Bar',
  'Bookmarks bar',
  'Bookmarks Toolbar',
  '书签栏',
  '收藏夹栏',
  'Favorites bar',
  '收藏夹',
]);

/** 需要排除的特殊文件夹 */
export const EXCLUDED_FOLDER_TITLES = new Set([HOME_FOLDER_TITLE]);

/**
 * 获取保存的根文件夹 ID
 */
export async function getSavedRootFolderId(): Promise<string | null> {
  return await getStorageItem<string>(STORAGE_KEY_ROOT_ID);
}

/**
 * 保存根文件夹 ID
 */
export async function saveRootFolderId(id: string): Promise<void> {
  const success = await setStorageItem(STORAGE_KEY_ROOT_ID, id);
  if (!success) {
    logger.error('[Storage] 保存根文件夹 ID 失败');
  }
}

/**
 * 获取保存的首页文件夹 ID
 */
export async function getSavedHomeFolderId(): Promise<string | null> {
  return await getStorageItem<string>(STORAGE_KEY_HOME_FOLDER_ID);
}

/**
 * 保存首页文件夹 ID
 */
export async function saveHomeFolderId(id: string): Promise<void> {
  const success = await setStorageItem(STORAGE_KEY_HOME_FOLDER_ID, id);
  if (!success) {
    logger.error('[Storage] 保存首页文件夹 ID 失败');
  }
}
