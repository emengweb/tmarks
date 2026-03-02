/**
 * NewTab 核心数据类型定义（方案 A：统一网格项模型）
 */

// ============================================
// 分组（Group）
// ============================================

export interface Group {
  id: string
  name: string
  icon: string
  position: number
  color?: string
  bookmarkFolderId?: string
  createdAt: number
  updatedAt: number
}

// ============================================
// 项目类型（ItemType）
// ============================================

export type ItemType = 
  | 'shortcut'
  | 'folder'
  | 'widget'
  | 'note'
  | 'rss'
  | 'custom'

// ============================================
// 项目（Item）- 统一数据模型
// ============================================

export interface Item {
  // 基础信息
  id: string
  type: ItemType
  groupId: string
  parentId: string | null
  position: number
  
  // 同步标识
  browserBookmarkId?: string
  serverItemId?: string
  
  // 类型特定数据
  data: ItemData
  
  // 元数据
  createdAt: number
  updatedAt: number
  deletedAt?: number
}

// ============================================
// 类型特定数据（ItemData）
// ============================================

export type ItemData = 
  | ShortcutData
  | FolderData
  | WidgetData
  | NoteData
  | RssData
  | CustomData

export interface ShortcutData {
  type: 'shortcut'
  url: string
  title: string
  favicon?: string
  faviconBase64?: string
  clickCount: number
  lastClickedAt?: number
}

export interface FolderData {
  type: 'folder'
  title: string
  icon?: string
  isExpanded?: boolean
}

export interface WidgetData {
  type: 'widget'
  widgetType: string
  config: Record<string, any>
}

export interface NoteData {
  type: 'note'
  title: string
  content: string
  tags?: string[]
}

export interface RssData {
  type: 'rss'
  feedUrl: string
  title: string
  updateInterval: number
}

export interface CustomData {
  type: 'custom'
  customType: string
  data: Record<string, any>
}

// ============================================
// 类型守卫（Type Guards）
// ============================================

export function isShortcut(item: Item): item is Item & { data: ShortcutData } {
  return item.type === 'shortcut' && item.data.type === 'shortcut'
}

export function isFolder(item: Item): item is Item & { data: FolderData } {
  return item.type === 'folder' && item.data.type === 'folder'
}

export function isWidget(item: Item): item is Item & { data: WidgetData } {
  return item.type === 'widget' && item.data.type === 'widget'
}

export function isNote(item: Item): item is Item & { data: NoteData } {
  return item.type === 'note' && item.data.type === 'note'
}

export function isRss(item: Item): item is Item & { data: RssData } {
  return item.type === 'rss' && item.data.type === 'rss'
}

export function isCustom(item: Item): item is Item & { data: CustomData } {
  return item.type === 'custom' && item.data.type === 'custom'
}

// ============================================
// 辅助类型（Helper Types）
// ============================================

export type ShortcutItem = Item & { data: ShortcutData }
export type FolderItem = Item & { data: FolderData }
export type WidgetItem = Item & { data: WidgetData }
export type NoteItem = Item & { data: NoteData }
export type RssItem = Item & { data: RssData }
export type CustomItem = Item & { data: CustomData }

// ============================================
// 创建辅助函数（Factory Functions）
// ============================================

export function createShortcut(
  params: {
    id?: string
    groupId: string
    parentId?: string | null
    url: string
    title: string
    favicon?: string
    position?: number
  }
): Item {
  const now = Date.now()
  return {
    id: params.id || crypto.randomUUID(),
    type: 'shortcut',
    groupId: params.groupId,
    parentId: params.parentId ?? null,
    position: params.position ?? 0,
    data: {
      type: 'shortcut',
      url: params.url,
      title: params.title,
      favicon: params.favicon,
      clickCount: 0,
    },
    createdAt: now,
    updatedAt: now,
  }
}

export function createFolder(
  params: {
    id?: string
    groupId: string
    parentId?: string | null
    title: string
    icon?: string
    position?: number
  }
): Item {
  const now = Date.now()
  return {
    id: params.id || crypto.randomUUID(),
    type: 'folder',
    groupId: params.groupId,
    parentId: params.parentId ?? null,
    position: params.position ?? 0,
    data: {
      type: 'folder',
      title: params.title,
      icon: params.icon,
      isExpanded: false,
    },
    createdAt: now,
    updatedAt: now,
  }
}

export function createWidget(
  params: {
    id?: string
    groupId: string
    parentId?: string | null
    widgetType: string
    config?: Record<string, any>
    position?: number
  }
): Item {
  const now = Date.now()
  return {
    id: params.id || crypto.randomUUID(),
    type: 'widget',
    groupId: params.groupId,
    parentId: params.parentId ?? null,
    position: params.position ?? 0,
    data: {
      type: 'widget',
      widgetType: params.widgetType,
      config: params.config || {},
    },
    createdAt: now,
    updatedAt: now,
  }
}
