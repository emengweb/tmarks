/**
 * NewTab 存储类型定义
 */

import type { Group, Item } from './core'

// ============================================
// 设置（Settings）
// ============================================

export interface NewTabSettings {
  // 显示开关
  showClock: boolean
  showSearch: boolean
  showShortcuts: boolean
  showGreeting: boolean
  showLunar: boolean
  showPoetry: boolean
  showDate: boolean
  showSeconds: boolean
  showPinnedBookmarks: boolean
  
  // 布局
  shortcutColumns: 6 | 8 | 10
  shortcutStyle?: 'icon' | 'card'
  
  // 壁纸
  wallpaper: WallpaperConfig
  
  // 搜索
  searchEngine: SearchEngine
  enableSearchSuggestions: boolean
  
  // 其他
  userName: string
  clockFormat: '12h' | '24h'
  autoRefreshPinnedBookmarks: boolean
  pinnedBookmarksRefreshTime: 'morning' | 'evening'
  showEditGuide?: boolean
}

// ============================================
// 壁纸配置
// ============================================

export type WallpaperType = 'color' | 'image' | 'bing' | 'unsplash'

export interface WallpaperConfig {
  type: WallpaperType
  value: string
  blur: number
  brightness: number
  bingHistoryIndex?: number
  showBingInfo?: boolean
}

// ============================================
// 搜索引擎
// ============================================

export type SearchEngine = 
  | 'google' 
  | 'bing' 
  | 'baidu' 
  | 'duckduckgo' 
  | 'sogou' 
  | 'zhihu' 
  | 'bilibili' 
  | 'github'

export interface SearchEngineConfig {
  id: SearchEngine
  name: string
  url: string
  icon: string
}

// ============================================
// 同步状态
// ============================================

export interface SyncState {
  lastSyncAt: number | null
  deviceId: string
  isSyncing: boolean
  error: string | null
}

// ============================================
// 存储结构（localStorage）
// ============================================

export interface NewTabStorage {
  groups: Group[]
  items: Item[]
  homeItems: Item[]
  activeView: 'home' | 'group'
  activeGroupId: string | null
  currentFolderId: string | null
  settings: NewTabSettings
  syncState?: SyncState
  
  // 浏览器书签同步状态
  browserBookmarksRootId?: string | null
  homeBrowserFolderId?: string | null
  
  // 迁移标记
  migrationVersion?: number
}

// ============================================
// 默认值
// ============================================

export const DEFAULT_WALLPAPER: WallpaperConfig = {
  type: 'bing',
  value: '',
  blur: 0,
  brightness: 100,
  bingHistoryIndex: 0,
  showBingInfo: false,
}

export const DEFAULT_SETTINGS: NewTabSettings = {
  showClock: true,
  clockFormat: '24h',
  showDate: true,
  showSeconds: false,
  showSearch: true,
  searchEngine: 'google',
  showShortcuts: true,
  shortcutColumns: 8,
  wallpaper: DEFAULT_WALLPAPER,
  showPinnedBookmarks: true,
  enableSearchSuggestions: true,
  autoRefreshPinnedBookmarks: true,
  pinnedBookmarksRefreshTime: 'morning',
  showGreeting: true,
  userName: '',
  showLunar: true,
  showPoetry: true,
  showEditGuide: true,
}
