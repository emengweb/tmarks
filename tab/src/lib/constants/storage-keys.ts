/**
 * 存储键名常量定义
 * 统一管理所有 localStorage 和 chrome.storage 的键名
 */

/**
 * NewTab 相关存储键
 */
export const NEWTAB_STORAGE_KEYS = {
  /** 同步队列 */
  SYNC_QUEUE: 'newtab_sync_queue',
  
  /** 天气缓存 */
  WEATHER: 'newtab_weather',
  
  /** 壁纸缓存 */
  WALLPAPER_CACHE: 'newtab_wallpaper_cache',
  
  /** Bing 壁纸信息缓存 */
  BING_INFO_CACHE: 'newtab_bing_info_cache',
  
  /** 批量编辑提示已关闭标记 */
  BATCH_EDIT_TIP_DISMISSED: 'tmarks_batch_edit_tip_dismissed',
} as const;

/**
 * TMarks 相关存储键
 */
export const TMARKS_STORAGE_KEYS = {
  /** 置顶书签缓存 */
  PINNED_BOOKMARKS: 'tmarks_pinned_bookmarks',
  
  /** 根文件夹 ID */
  ROOT_BOOKMARK_ID: 'tmarks_root_bookmark_id',
  
  /** 首页文件夹 ID */
  HOME_BOOKMARK_ID: 'tmarks_home_bookmark_id',
  
  /** 工作区 UUID */
  WORKSPACE_UUID: 'tmarks_workspace_uuid',
} as const;

/**
 * 通用存储键
 */
export const COMMON_STORAGE_KEYS = {
  /** 设备 ID */
  DEVICE_ID: 'device_id',
  
  /** 语言设置 */
  LANGUAGE: 'language',
} as const;

/**
 * 所有存储键的联合类型
 */
export type StorageKey = 
  | typeof NEWTAB_STORAGE_KEYS[keyof typeof NEWTAB_STORAGE_KEYS]
  | typeof TMARKS_STORAGE_KEYS[keyof typeof TMARKS_STORAGE_KEYS]
  | typeof COMMON_STORAGE_KEYS[keyof typeof COMMON_STORAGE_KEYS];
