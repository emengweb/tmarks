/**
 * 数据迁移工具
 * 将旧的 Shortcut 数据结构迁移到新的 Item 数据结构
 */

import type { Item, Group } from '../types/core'
import type { Shortcut, ShortcutGroup, GridItem } from '../types.old'
import { logger } from '@/lib/utils/logger'

// ============================================
// 迁移版本
// ============================================

export const CURRENT_MIGRATION_VERSION = 1

// ============================================
// 迁移：Shortcut → Item
// ============================================

export function migrateShortcutToItem(shortcut: Shortcut): Item {
  return {
    id: shortcut.id,
    type: 'shortcut',
    groupId: shortcut.groupId || '__home__',
    parentId: shortcut.folderId || null,
    position: shortcut.position,
    browserBookmarkId: undefined,
    serverItemId: undefined,
    data: {
      type: 'shortcut',
      url: shortcut.url,
      title: shortcut.title,
      favicon: shortcut.favicon,
      clickCount: shortcut.clickCount || 0,
      lastClickedAt: undefined,
    },
    createdAt: shortcut.createdAt,
    updatedAt: Date.now(),
  }
}

// ============================================
// 迁移：GridItem → Item
// ============================================

export function migrateGridItemToItem(gridItem: GridItem): Item {
  const now = Date.now()
  
  if (gridItem.type === 'shortcut' && gridItem.shortcut) {
    return {
      id: gridItem.id,
      type: 'shortcut',
      groupId: gridItem.groupId || '__home__',
      parentId: gridItem.parentId || null,
      position: gridItem.position,
      browserBookmarkId: gridItem.browserBookmarkId,
      serverItemId: gridItem.tmarksBookmarkId,
      data: {
        type: 'shortcut',
        url: gridItem.shortcut.url,
        title: gridItem.shortcut.title,
        favicon: gridItem.shortcut.favicon,
        clickCount: 0,
      },
      createdAt: gridItem.createdAt,
      updatedAt: now,
    }
  }
  
  if (gridItem.type === 'bookmarkFolder' && gridItem.bookmarkFolder) {
    return {
      id: gridItem.id,
      type: 'folder',
      groupId: gridItem.groupId || '__home__',
      parentId: gridItem.parentId || null,
      position: gridItem.position,
      browserBookmarkId: gridItem.browserBookmarkId,
      serverItemId: gridItem.tmarksBookmarkId,
      data: {
        type: 'folder',
        title: gridItem.bookmarkFolder.title,
        icon: undefined,
        isExpanded: false,
      },
      createdAt: gridItem.createdAt,
      updatedAt: now,
    }
  }
  
  // 未知类型，创建一个占位符
  logger.warn('[Migration] Unknown GridItem type:', gridItem.type)
  return {
    id: gridItem.id,
    type: 'folder',
    groupId: gridItem.groupId || '__home__',
    parentId: gridItem.parentId || null,
    position: gridItem.position,
    data: {
      type: 'folder',
      title: 'Unknown',
      isExpanded: false,
    },
    createdAt: gridItem.createdAt || now,
    updatedAt: now,
  }
}

// ============================================
// 迁移：ShortcutGroup → Group
// ============================================

export function migrateShortcutGroupToGroup(shortcutGroup: ShortcutGroup): Group {
  return {
    id: shortcutGroup.id,
    name: shortcutGroup.name,
    icon: shortcutGroup.icon,
    position: shortcutGroup.position,
    bookmarkFolderId: shortcutGroup.bookmarkFolderId || undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

// ============================================
// 批量迁移
// ============================================

export function migrateShortcutsToItems(shortcuts: Shortcut[]): Item[] {
  return shortcuts.map(migrateShortcutToItem)
}

export function migrateGridItemsToItems(gridItems: GridItem[]): Item[] {
  return gridItems.map(migrateGridItemToItem)
}

export function migrateShortcutGroupsToGroups(shortcutGroups: ShortcutGroup[]): Group[] {
  return shortcutGroups.map(migrateShortcutGroupToGroup)
}

// ============================================
// 智能迁移（自动检测数据源）
// ============================================

export function migrateToNewStructure(data: {
  shortcuts?: Shortcut[]
  gridItems?: GridItem[]
  shortcutGroups?: ShortcutGroup[]
}): {
  items: Item[]
  groups: Group[]
} {
  let items: Item[] = []
  let groups: Group[] = []
  
  // 优先使用 gridItems（新版数据）
  if (data.gridItems && data.gridItems.length > 0) {
    logger.info('[Migration] Migrating from gridItems')
    items = migrateGridItemsToItems(data.gridItems)
  } 
  // 降级使用 shortcuts（旧版数据）
  else if (data.shortcuts && data.shortcuts.length > 0) {
    logger.info('[Migration] Migrating from shortcuts')
    items = migrateShortcutsToItems(data.shortcuts)
  }
  
  // 迁移分组
  if (data.shortcutGroups && data.shortcutGroups.length > 0) {
    groups = migrateShortcutGroupsToGroups(data.shortcutGroups)
  }
  
  return { items, groups }
}
