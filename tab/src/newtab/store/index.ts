/**
 * NewTab Store（新版 - 统一数据模型）
 */

import { create } from 'zustand'
import type { NewTabState } from './types'
import type { Item, Group } from '../types/core'
import type { NewTabStorage } from '../types/storage'
import { DEFAULT_SETTINGS } from '../types/storage'
import { migrateToNewStructure, CURRENT_MIGRATION_VERSION } from '../utils/migration'
import { logger } from '@/lib/utils/logger'
import { createGroupActions } from './actions/groups'
import { createItemActions } from './actions/items'
import { createHomeActions } from './actions/home'
import { createFolderActions } from './actions/folders'
import { createSettingsActions } from './actions/settings'
import { createBrowserBookmarkActions } from './actions/browser-bookmarks'

const STORAGE_KEY = 'newtab'

// ============================================
// Store 创建
// ============================================

export const useNewtabStore = create<NewTabState>((set, get) => {
  // 创建 Actions
  const groupActions = createGroupActions(get, set)
  const itemActions = createItemActions(get, set)
  const homeActions = createHomeActions(get, set)
  const folderActions = createFolderActions(get, set)
  const settingsActions = createSettingsActions(get, set)
  const browserBookmarkActions = createBrowserBookmarkActions(get, set)

  return {
    // 初始状态
    groups: [],
    items: [],
    homeItems: [],
    activeView: 'home',
    activeGroupId: null,
    currentFolderId: null,
    settings: DEFAULT_SETTINGS,
    isLoading: true,
    browserBookmarksRootId: null,
    homeBrowserFolderId: null,
    isApplyingBrowserBookmarks: false,
    browserBookmarkWriteLockUntil: 0,

    // 数据加载
    loadData: async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY)
        const data = result[STORAGE_KEY] as NewTabStorage | undefined

        // 检查是否需要迁移
        const needsMigration = !data?.migrationVersion || data.migrationVersion < CURRENT_MIGRATION_VERSION

        let groups: Group[] = []
        let items: Item[] = []
        let homeItems: Item[] = []
        let settings = DEFAULT_SETTINGS

        if (data) {
          if (needsMigration) {
            logger.info('[Store] Migrating data to new structure')
            const migrated = migrateToNewStructure({
              shortcuts: (data as any).shortcuts,
              gridItems: (data as any).gridItems,
              shortcutGroups: (data as any).shortcutGroups,
            })
            
            // 迁移后，将 home 分组的项目移到 homeItems
            groups = migrated.groups.filter(g => g.id !== 'home')
            const homeGroupItems = migrated.items.filter(i => i.groupId === 'home')
            const otherItems = migrated.items.filter(i => i.groupId !== 'home')
            
            homeItems = homeGroupItems.map(item => ({ ...item, groupId: '__home__' }))
            items = otherItems
            
            logger.info('[Store] Migration complete:', items.length, 'items,', homeItems.length, 'home items')
          } else {
            groups = data.groups || []
            items = data.items || []
            homeItems = data.homeItems || []
          }

          settings = { ...DEFAULT_SETTINGS, ...data.settings }
        }

        // 确定初始视图和激活分组
        let activeView: 'home' | 'group' = data?.activeView || 'home'
        let activeGroupId: string | null = data?.activeGroupId || null
        
        // 如果 activeView 是 group 但没有有效的 activeGroupId，切换到 home
        if (activeView === 'group' && (!activeGroupId || !groups.some(g => g.id === activeGroupId))) {
          if (groups.length > 0) {
            activeGroupId = groups[0].id
          } else {
            activeView = 'home'
            activeGroupId = null
          }
        }

        set({
          groups,
          items,
          homeItems,
          activeView,
          activeGroupId,
          currentFolderId: data?.currentFolderId || null,
          settings,
          browserBookmarksRootId: data?.browserBookmarksRootId || null,
          homeBrowserFolderId: data?.homeBrowserFolderId || null,
          isLoading: false,
        })

        // 如果进行了迁移，立即保存
        if (needsMigration) {
          get().saveData()
        }

        logger.info('[Store] Data loaded:', items.length, 'items,', homeItems.length, 'home items,', groups.length, 'groups')
      } catch (error) {
        logger.error('[Store] Failed to load data:', error)
        set({ isLoading: false })
      }
    },

    // 数据保存
    saveData: async () => {
      const state = get()
      const data: NewTabStorage = {
        groups: state.groups,
        items: state.items,
        homeItems: state.homeItems,
        activeView: state.activeView,
        activeGroupId: state.activeGroupId,
        currentFolderId: state.currentFolderId,
        settings: state.settings,
        browserBookmarksRootId: state.browserBookmarksRootId,
        homeBrowserFolderId: state.homeBrowserFolderId,
        migrationVersion: CURRENT_MIGRATION_VERSION,
      }

      try {
        await chrome.storage.local.set({ [STORAGE_KEY]: data })
        logger.debug('[Store] Data saved')
      } catch (error) {
        logger.error('[Store] Failed to save data:', error)
      }
    },

    // 视图切换 Actions
    setActiveView: (view: 'home' | 'group') => {
      set({ activeView: view, currentFolderId: null })
      get().saveData()
    },

    setActiveGroup: (groupId: string | null) => {
      if (groupId) {
        set({ activeView: 'group', activeGroupId: groupId, currentFolderId: null })
      } else {
        set({ activeView: 'home', activeGroupId: null, currentFolderId: null })
      }
      get().saveData()
    },

    // 分组 Actions
    ...groupActions,

    // 项目 Actions
    ...itemActions,

    // 首页 Actions
    ...homeActions,

    // 文件夹 Actions
    ...folderActions,

    // 设置 Actions
    ...settingsActions,

    // 浏览器书签同步 Actions
    ...browserBookmarkActions,
  }
})
