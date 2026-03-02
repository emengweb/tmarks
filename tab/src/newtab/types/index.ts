/**
 * NewTab 类型统一导出
 */

// 核心类型
export type { Group, Item, ItemType, ItemData, ShortcutData, FolderData, WidgetData, NoteData, RssData, CustomData, ShortcutItem, FolderItem, WidgetItem, NoteItem, RssItem, CustomItem } from './core'
export { isShortcut, isFolder, isWidget, isNote, isRss, isCustom, createShortcut, createFolder, createWidget } from './core'

// 存储类型
export type { NewTabSettings, NewTabStorage, WallpaperType, WallpaperConfig, SearchEngine, SearchEngineConfig, SyncState } from './storage'
export { DEFAULT_WALLPAPER, DEFAULT_SETTINGS } from './storage'

// 同步类型
export type { Operation, OperationType, TargetType, SyncPushRequest, SyncPushResponse, SyncPullParams, SyncPullResponse, SyncFullResponse } from './sync'

// 兼容旧代码的类型别名
export type ClockFormat = '12h' | '24h'

// 诗词
export interface Poetry {
  content: string
  author: string
  title: string
}

// Bing 壁纸信息
export interface BingWallpaperInfo {
  url: string
  title: string
  copyright: string
  date: string
}

// 搜索结果
export interface SearchResult {
  id: string
  title: string
  url: string
  favicon?: string
  source: 'shortcut' | 'bookmark'
  tags?: Array<{
    id: string
    name: string
    color: string
  }>
  description?: string
  click_count?: number
  is_pinned?: boolean
}

// TMarks 书签
export interface TMarksBookmark {
  id: string
  url: string
  title: string
  favicon?: string
  is_pinned?: boolean
  tags?: Array<{
    id: string
    name: string
    color: string
  }>
  description?: string
  click_count?: number
}
