import Dexie, { Table } from 'dexie';
import type { Tag, Bookmark, Metadata, TabGroup, TabGroupItem } from '@/types';

export class BookmarkDB extends Dexie {
  tags!: Table<Tag>;
  bookmarks!: Table<Bookmark>;
  metadata!: Table<Metadata>;
  tabGroups!: Table<TabGroup>;
  tabGroupItems!: Table<TabGroupItem>;

  constructor() {
    super('BookmarkDB');

    this.version(1).stores({
      tags: '++id, name, color, createdAt, count',
      bookmarks: '++id, url, title, createdAt, remoteId, *tags',
      metadata: 'key, updatedAt'
    });

    // Version 2: Add tab groups support
    this.version(2).stores({
      tags: '++id, name, color, createdAt, count',
      bookmarks: '++id, url, title, createdAt, remoteId, *tags',
      metadata: 'key, updatedAt',
      tabGroups: '++id, title, createdAt, remoteId',
      tabGroupItems: '++id, groupId, title, url, position, createdAt'
    });

    // Version 3: Clean duplicate data (prepare for unique constraints)
    this.version(3).stores({
      tags: '++id, name, color, createdAt, count',
      bookmarks: '++id, url, title, createdAt, remoteId, *tags',
      metadata: 'key, updatedAt',
      tabGroups: '++id, title, createdAt, remoteId',
      tabGroupItems: '++id, groupId, title, url, position, createdAt'
    }).upgrade(async (trans) => {
      console.log('[DB Upgrade v3] 清理重复数据...');
      
      try {
        // 清理重复标签
        const tags = await trans.table('tags').toArray();
        const seenNames = new Set<string>();
        const duplicateTags: number[] = [];
        
        for (const tag of tags) {
          if (seenNames.has(tag.name)) {
            if (tag.id) duplicateTags.push(tag.id);
          } else {
            seenNames.add(tag.name);
          }
        }
        
        if (duplicateTags.length > 0) {
          await trans.table('tags').bulkDelete(duplicateTags);
          console.log(`[DB Upgrade v3] 删除 ${duplicateTags.length} 个重复标签`);
        }
        
        // 清理重复书签
        const bookmarks = await trans.table('bookmarks').toArray();
        const seenUrls = new Set<string>();
        const duplicateBookmarks: number[] = [];
        
        for (const bookmark of bookmarks) {
          if (seenUrls.has(bookmark.url)) {
            if (bookmark.id) duplicateBookmarks.push(bookmark.id);
          } else {
            seenUrls.add(bookmark.url);
          }
        }
        
        if (duplicateBookmarks.length > 0) {
          await trans.table('bookmarks').bulkDelete(duplicateBookmarks);
          console.log(`[DB Upgrade v3] 删除 ${duplicateBookmarks.length} 个重复书签`);
        }
        
        console.log('[DB Upgrade v3] 清理完成');
      } catch (error) {
        console.error('[DB Upgrade v3] 清理失败:', error);
        throw error;
      }
    });

    // Version 4: Add unique constraints (after cleaning duplicates)
    this.version(4).stores({
      tags: '++id, &name, color, createdAt, count',
      bookmarks: '++id, &url, title, createdAt, remoteId, *tags',
      metadata: 'key, updatedAt',
      tabGroups: '++id, title, createdAt, remoteId',
      tabGroupItems: '++id, groupId, title, url, position, createdAt'
    });
  }

  // Helper methods
  async getLastSyncTime(): Promise<number> {
    const meta = await this.metadata.get('lastSync');
    return meta && typeof meta.value === 'number' ? meta.value : 0;
  }

  async updateLastSyncTime(timestamp: number): Promise<void> {
    await this.metadata.put({
      key: 'lastSync',
      value: timestamp,
      updatedAt: Date.now()
    });
  }

  async getStats(): Promise<{ tags: number; bookmarks: number; lastSync: number }> {
    const [tagsCount, bookmarksCount, lastSync] = await Promise.all([
      this.tags.count(),
      this.bookmarks.count(),
      this.getLastSyncTime()
    ]);

    return {
      tags: tagsCount,
      bookmarks: bookmarksCount,
      lastSync
    };
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.tags.clear(),
      this.bookmarks.clear(),
      this.metadata.clear(),
      this.tabGroups.clear(),
      this.tabGroupItems.clear()
    ]);
  }

  /**
   * Delete and recreate database (for recovery from corruption)
   */
  async resetDatabase(): Promise<void> {
    await this.delete();
    await this.open();
    console.log('[DB] 数据库已重置');
  }
}

// Create singleton instance
export const db = new BookmarkDB();
