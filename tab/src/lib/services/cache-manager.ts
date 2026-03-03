import { db } from '@/lib/db';
import { bookmarkAPI } from './bookmark-api';
import { tagRecommender } from './tag-recommender';
import type { SyncResult } from '@/types';
import { PAGINATION } from '@/lib/constants/urls';

export class CacheManager {
  /**
   * Full sync: Clear and reload all data from bookmark site
   */
  async fullSync(): Promise<SyncResult> {
    const startTime = Date.now();

    try {
      console.log('[CacheManager] 开始完全同步...');
      
      // 1. Fetch and cache tags
      const tags = await bookmarkAPI.getTags();
      await db.tags.clear();
      await db.tags.bulkPut(tags);  // 使用 bulkPut 避免唯一约束冲突
      console.log(`[CacheManager] 同步标签完成: ${tags.length} 个`);

      // 2. Fetch and cache bookmarks (cursor-based pagination)
      let cursor: string | undefined = undefined;
      let totalBookmarks = 0;
      let pageNum = 1;
      await db.bookmarks.clear();
      console.log('[CacheManager] 已清空本地书签缓存');

      while (pageNum <= PAGINATION.MAX_PAGES) { // Safety limit
        const { bookmarks, hasMore, nextCursor } = await bookmarkAPI.getBookmarks(cursor, PAGINATION.DEFAULT_PAGE_SIZE);
        console.log(`[CacheManager] 第 ${pageNum} 页: 获取 ${bookmarks.length} 个书签, hasMore: ${hasMore}, nextCursor: ${nextCursor || 'null'}`);

        if (bookmarks.length > 0) {
          // 使用 bulkPut 而不是 bulkAdd，避免唯一约束冲突
          // bulkPut 会自动更新已存在的记录
          await db.bookmarks.bulkPut(bookmarks);
          totalBookmarks += bookmarks.length;
        }

        if (!hasMore) {
          console.log(`[CacheManager] 同步完成，共 ${totalBookmarks} 个书签`);
          break;
        }
        
        cursor = nextCursor;
        pageNum++;
      }

      // 3. Update metadata
      await db.updateLastSyncTime(Date.now());
      await db.metadata.put({
        key: 'totalTags',
        value: tags.length,
        updatedAt: Date.now()
      });
      await db.metadata.put({
        key: 'totalBookmarks',
        value: totalBookmarks,
        updatedAt: Date.now()
      });

      await tagRecommender.refreshContextFromDB();

      const duration = Date.now() - startTime;
      console.log(`[CacheManager] 同步耗时: ${duration}ms`);

      return {
        success: true,
        duration,
        stats: {
          tags: tags.length,
          bookmarks: totalBookmarks
        }
      };
    } catch (error) {
      console.error('[CacheManager] 同步失败:', error);
      
      // 如果是数据库错误，尝试重置数据库
      if (error instanceof Error && 
          (error.message.includes('Backend aborted') || 
           error.message.includes('InvalidStateError'))) {
        console.log('[CacheManager] 检测到数据库损坏，尝试重置...');
        try {
          await db.resetDatabase();
          console.log('[CacheManager] 数据库重置成功，请重新同步');
          return {
            success: false,
            error: '数据库已重置，请重新点击同步按钮'
          };
        } catch (resetError) {
          console.error('[CacheManager] 数据库重置失败:', resetError);
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Incremental sync: Only fetch recent changes
   * Note: Requires bookmark site to support 'since' parameter
   * Falls back to full sync if not supported
   */
  async incrementalSync(): Promise<SyncResult> {
    try {
      const lastSync = await db.getLastSyncTime();

      if (lastSync === 0) {
        // No previous sync, do full sync
        return this.fullSync();
      }

      // TODO: Implement incremental sync when API supports it
      // For now, we'll do a simple full sync
      // In production, you would:
      // 1. GET /api/bookmarks?since={lastSync}
      // 2. GET /api/tags?since={lastSync}
      // 3. Merge changes into existing data

      return this.fullSync();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ tags: number; bookmarks: number; lastSync: number }> {
    return db.getStats();
  }

  /**
   * Check if cache is stale (older than specified hours)
   */
  async isCacheStale(maxAgeHours: number = 24): Promise<boolean> {
    const lastSync = await db.getLastSyncTime();
    if (lastSync === 0) return true;

    const maxAge = maxAgeHours * 60 * 60 * 1000;
    return Date.now() - lastSync > maxAge;
  }

  /**
   * Auto sync: Check if cache is stale and sync if needed
   */
  async autoSync(maxAgeHours: number = 24): Promise<SyncResult | null> {
    const isStale = await this.isCacheStale(maxAgeHours);

    if (isStale) {
      return this.incrementalSync();
    }

    return null;
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await db.clearAll();
    tagRecommender.clearContextCache();
  }
}

// Singleton instance
export const cacheManager = new CacheManager();
