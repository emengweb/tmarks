/**
 * 旧版 NewTab 类型定义（仅用于数据迁移）
 * 这些类型将在迁移完成后删除
 */

// ============================================
// 旧版：Shortcut
// ============================================

export interface Shortcut {
  id: string
  url: string
  title: string
  favicon?: string
  faviconBase64?: string
  position: number
  createdAt: number
  clickCount: number
  groupId?: string
  folderId?: string
}

// ============================================
// 旧版：ShortcutGroup
// ============================================

export interface ShortcutGroup {
  id: string
  name: string
  icon: string
  position: number
  bookmarkFolderId?: string | null
}

// ============================================
// 旧版：ShortcutFolder
// ============================================

export interface ShortcutFolder {
  id: string
  name: string
  icon?: string
  position: number
  groupId?: string
  createdAt: number
}

// ============================================
// 旧版：GridItem
// ============================================

export type GridItemSize = '1x1' | '2x1' | '1x2' | '2x2' | '2x3' | '2x4'
export type GridItemType = 'shortcut' | 'bookmarkFolder'

export interface GridItem {
  id: string
  type: GridItemType
  size: GridItemSize
  position: number
  groupId?: string
  parentId?: string | null
  browserBookmarkId?: string
  tmarksBookmarkId?: string
  shortcut?: {
    url: string
    title: string
    favicon?: string
    faviconBase64?: string
  }
  bookmarkFolder?: {
    title: string
  }
  config?: any
  createdAt: number
}
