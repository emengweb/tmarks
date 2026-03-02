/**
 * Favicon 自动缓存 Hook
 * 使用 IndexedDB 存储图片 Blob，比 base64 更高效
 */

import { useEffect, useRef } from 'react';
import { useNewtabStore } from './index';
import { getFaviconUrl } from '@/lib/services/favicon';
import { downloadAndCache, cleanExpiredCache } from '../services/favicon-cache';
import { logger } from '@/lib/utils/logger';
import { DURATIONS } from '@/lib/constants/durations';
import { TIMEOUTS } from '@/lib/constants/timeouts';

const CACHE_CHECK_INTERVAL = DURATIONS.ONE_HOUR; // 每小时检查一次
const BATCH_SIZE = 10; // 每批处理 10 个
const BATCH_DELAY = TIMEOUTS.MEDIUM; // 批次间隔
const INITIAL_DELAY = TIMEOUTS.LONG; // 初始延迟

/**
 * 自动缓存 Favicon Hook
 * 
 * 功能：
 * 1. 页面加载后自动检查未缓存的图标
 * 2. 分批下载到 IndexedDB，避免一次性请求过多
 * 3. 定期检查新增的快捷方式
 * 4. 定期清理过期缓存
 * 5. 静默失败，不影响用户体验
 */
export function useFaviconCache() {
  const { items, isLoading } = useNewtabStore();
  const lastCheckRef = useRef<number>(0);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const checkAndCache = async () => {
      // 避免重复处理
      if (isProcessingRef.current) return;

      // 检查是否需要执行（距离上次检查超过 1 小时）
      const now = Date.now();
      if (now - lastCheckRef.current < CACHE_CHECK_INTERVAL) {
        return;
      }

      lastCheckRef.current = now;
      isProcessingRef.current = true;

      try {
        // 筛选出需要缓存的快捷方式
        const shortcuts = items
          .filter(item => {
            if (item.type !== 'shortcut') return false;
            const data = item.data as { url: string };
            // 跳过无效 URL
            if (!data.url || !data.url.startsWith('http')) return false;
            return true;
          })
          .map(item => ({
            id: item.id,
            url: (item.data as any).url,
          }));

        if (shortcuts.length === 0) {
          logger.info('[FaviconCache] No shortcuts need caching');
          return;
        }

        logger.info(`[FaviconCache] Found ${shortcuts.length} shortcuts to cache`);

        // 分批处理
        let cachedCount = 0;
        for (let i = 0; i < shortcuts.length; i += BATCH_SIZE) {
          const batch = shortcuts.slice(i, i + BATCH_SIZE);
          
          logger.info(`[FaviconCache] Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(shortcuts.length / BATCH_SIZE)}`);

          // 并发下载当前批次
          await Promise.allSettled(
            batch.map(async (shortcut) => {
              try {
                const faviconUrl = getFaviconUrl({ url: shortcut.url, size: 64 });
                const result = await downloadAndCache(shortcut.url, faviconUrl);
                if (result) {
                  cachedCount++;
                }
              } catch (error) {
                logger.warn(`[FaviconCache] Failed to cache ${shortcut.url}:`, error);
              }
            })
          );

          // 批次间延迟
          if (i + BATCH_SIZE < shortcuts.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
          }
        }

        logger.info(`[FaviconCache] Cached ${cachedCount}/${shortcuts.length} favicons`);

        // 清理过期缓存
        const cleaned = await cleanExpiredCache();
        if (cleaned > 0) {
          logger.info(`[FaviconCache] Cleaned ${cleaned} expired entries`);
        }
      } catch (error) {
        logger.error('[FaviconCache] Failed to cache favicons:', error);
      } finally {
        isProcessingRef.current = false;
      }
    };

    // 延迟后开始检查（避免影响页面加载）
    const timer = setTimeout(() => {
      checkAndCache();
    }, INITIAL_DELAY);

    // 定期检查（每小时）
    const interval = setInterval(() => {
      checkAndCache();
    }, CACHE_CHECK_INTERVAL);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [items, isLoading]);
}
