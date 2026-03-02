/**
 * NewTab Store 类型定义（新版）
 */

import type { Group, Item } from '../types/core'
import type { NewTabSettings } from '../types/storage'

// ============================================
// Store State
// ============================================

export interface NewTabState {
  // 数据
  groups: Group[]
  items: Item[]
  homeItems: Item[] // 首页独立的项目列表
  activeView: 'home' | 'group' // 当前视图：首页 or 分组
  activeGroupId: string | null // 当前激活的分组 ID（仅在 group 视图时有效）
  currentFolderId: string | null
  settings: NewTabSettings
  isLoading: boolean
  
  // 浏览器书签同步状态
  browserBookmarksRootId: string | null
  homeBrowserFolderId: string | null
  isApplyingBrowserBookmarks: boolean
  browserBookmarkWriteLockUntil: number
  
  // Actions - 数据加载/保存
  loadData: () => Promise<void>
  saveData: () => Promise<void>
  
  // Actions - 视图切换
  setActiveView: (view: 'home' | 'group') => void
  setActiveGroup: (groupId: string | null) => void
  
  // Actions - 分组操作
  addGroup: (name: string, icon: string, options?: AddGroupOptions) => void
  updateGroup: (id: string, updates: Partial<Group>) => void
  removeGroup: (id: string, options?: RemoveGroupOptions) => void
  reorderGroups: (fromIndex: number, toIndex: number) => void
  
  // Actions - 项目操作
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => string
  addHomeItem: (item: Omit<Item, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>) => string
  updateItem: (id: string, updates: Partial<Item>) => void
  updateHomeItem: (id: string, updates: Partial<Omit<Item, 'groupId'>>) => void
  removeItem: (id: string) => void
  removeHomeItem: (id: string) => void
  moveItem: (id: string, targetGroupId: string, targetParentId: string | null) => void
  moveHomeItem: (id: string, targetParentId: string | null) => void
  reorderItems: (groupId: string, parentId: string | null, fromIndex: number, toIndex: number) => void
  reorderHomeItems: (parentId: string | null, fromIndex: number, toIndex: number) => void
  
  // Actions - 文件夹操作
  setCurrentFolder: (folderId: string | null) => void
  removeFolder: (id: string, mode: 'keep' | 'all') => void
  
  // Actions - 快捷方式操作
  incrementClickCount: (id: string) => void
  
  // Actions - 设置操作
  updateSettings: (updates: Partial<NewTabSettings>) => void
  
  // Actions - 查询操作
  getFilteredItems: () => Item[]
  getFilteredHomeItems: () => Item[]
  getItemsByGroup: (groupId: string) => Item[]
  getItemsByParent: (parentId: string | null) => Item[]
  getHomeItemsByParent: (parentId: string | null) => Item[]
  getItemChildren: (itemId: string) => Item[]
  
  // Actions - 浏览器书签同步
  setBrowserBookmarksRootId: (rootId: string | null) => void
  setHomeBrowserFolderId: (folderId: string | null) => void
  setIsApplyingBrowserBookmarks: (isApplying: boolean) => void
  setBrowserBookmarkWriteLockUntil: (until: number) => void
  setGroupBookmarkFolderId: (groupId: string, folderId: string | null) => void
  ensureGroupBookmarkFolderId: (groupId: string, options?: EnsureGroupOptions) => Promise<string | null>
  
  // Actions - 浏览器书签增量同步
  upsertBrowserBookmarkNode: (node: BookmarkNodeInfo) => void
  removeBrowserBookmarkById: (bookmarkId: string) => void
  applyBrowserBookmarkChildrenOrder: (parentBookmarkId: string, orderedChildBookmarkIds: string[]) => void
  replaceBrowserBookmarkItems: (items: Item[], options?: ReplaceItemsOptions) => void
  mirrorHomeItemsToBrowser: (ids: string[]) => void
}

// ============================================
// Action Options
// ============================================

export interface AddGroupOptions {
  bookmarkFolderId?: string | null
  skipBookmarkFolderCreation?: boolean
}

export interface RemoveGroupOptions {
  skipBrowserBookmarkDeletion?: boolean
}

export interface EnsureGroupOptions {
  createIfMissing?: boolean
  bookmarkFolderIdOverride?: string | null
}

export interface ReplaceItemsOptions {
  groupIds?: string[]
}

export interface BookmarkNodeInfo {
  id: string
  parentId?: string
  title?: string
  url?: string
  index?: number
}
