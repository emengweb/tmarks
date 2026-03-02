/**
 * Favicon 本地缓存服务
 * 使用 IndexedDB 存储图片 Blob，比 base64 更高效
 */

import { logger } from '@/lib/utils/logger';
import { DURATIONS } from '@/lib/constants/durations';

const DB_NAME = 'favicon_cache';
const DB_VERSION = 1;
const STORE_NAME = 'favicons';
const CACHE_DURATION = DURATIONS.ONE_DAY * 30; // 缓存 30 天

interface FaviconCacheEntry {
  url: string; // 网站 URL（作为 key）
  blob: Blob; // 图片 Blob
  mimeType: string; // MIME 类型
  cachedAt: number; // 缓存时间
  size: number; // 文件大小
}

/**
 * 初始化 IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // 创建对象存储
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };
  });
}

/**
 * 从缓存获取 Favicon
 */
export async function getCachedFavicon(url: string): Promise<string | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(url);
      
      request.onsuccess = () => {
        const entry = request.result as FaviconCacheEntry | undefined;
        
        if (!entry) {
          resolve(null);
          return;
        }
        
        // 检查是否过期
        const now = Date.now();
        if (now - entry.cachedAt > CACHE_DURATION) {
          // 过期，删除并返回 null
          deleteCachedFavicon(url);
          resolve(null);
          return;
        }
        
        // 转换 Blob 为 Object URL
        const objectUrl = URL.createObjectURL(entry.blob);
        resolve(objectUrl);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('[FaviconCache] Failed to get cached favicon:', error);
    return null;
  }
}

/**
 * 缓存 Favicon
 */
export async function cacheFavicon(url: string, blob: Blob): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const entry: FaviconCacheEntry = {
      url,
      blob,
      mimeType: blob.type,
      cachedAt: Date.now(),
      size: blob.size,
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      
      request.onsuccess = () => {
        logger.debug(`[FaviconCache] Cached favicon for ${url} (${(blob.size / 1024).toFixed(2)}KB)`);
        resolve(true);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('[FaviconCache] Failed to cache favicon:', error);
    return false;
  }
}

/**
 * 删除缓存的 Favicon
 */
export async function deleteCachedFavicon(url: string): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(url);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('[FaviconCache] Failed to delete cached favicon:', error);
    return false;
  }
}

/**
 * 清空所有缓存
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        logger.info('[FaviconCache] Cleared all cached favicons');
        resolve(true);
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('[FaviconCache] Failed to clear cache:', error);
    return false;
  }
}

/**
 * 获取缓存统计信息
 */
export async function getCacheStats(): Promise<{
  count: number;
  totalSize: number;
}> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result as FaviconCacheEntry[];
        const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
        
        resolve({
          count: entries.length,
          totalSize,
        });
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('[FaviconCache] Failed to get cache stats:', error);
    return { count: 0, totalSize: 0 };
  }
}

/**
 * 清理过期缓存
 */
export async function cleanExpiredCache(): Promise<number> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('cachedAt');
    
    const now = Date.now();
    const expiredBefore = now - CACHE_DURATION;
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor();
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null;
        
        if (cursor) {
          const entry = cursor.value as FaviconCacheEntry;
          
          if (entry.cachedAt < expiredBefore) {
            cursor.delete();
            deletedCount++;
          }
          
          cursor.continue();
        } else {
          logger.info(`[FaviconCache] Cleaned ${deletedCount} expired entries`);
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.error('[FaviconCache] Failed to clean expired cache:', error);
    return 0;
  }
}

/**
 * 下载并缓存 Favicon
 */
export async function downloadAndCache(
  url: string,
  faviconUrl: string
): Promise<string | null> {
  try {
    // 先检查缓存
    const cached = await getCachedFavicon(url);
    if (cached) return cached;
    
    // 下载图片
    const response = await fetch(faviconUrl);
    if (!response.ok) return null;
    
    const blob = await response.blob();
    
    // 检查是否是有效图片
    if (blob.size < 100) return null;
    
    // 缓存
    await cacheFavicon(url, blob);
    
    // 返回 Object URL
    return URL.createObjectURL(blob);
  } catch (error) {
    logger.error('[FaviconCache] Failed to download and cache:', error);
    return null;
  }
}
