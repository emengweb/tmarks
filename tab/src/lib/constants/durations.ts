/**
 * 时间间隔常量定义
 * 统一管理所有时间间隔，避免魔法数字
 */

export const DURATIONS = {
  /** 1 秒（毫秒） */
  ONE_SECOND: 1000,
  
  /** 2 秒（毫秒） */
  TWO_SECONDS: 2000,
  
  /** 3 秒（毫秒） */
  THREE_SECONDS: 3000,
  
  /** 5 秒（毫秒） */
  FIVE_SECONDS: 5000,
  
  /** 10 秒（毫秒） */
  TEN_SECONDS: 10000,
  
  /** 30 秒（毫秒） */
  THIRTY_SECONDS: 30000,
  
  /** 1 分钟（毫秒） */
  ONE_MINUTE: 60 * 1000,
  
  /** 30 分钟（毫秒） */
  THIRTY_MINUTES: 30 * 60 * 1000,
  
  /** 1 小时（毫秒） */
  ONE_HOUR: 60 * 60 * 1000,
  
  /** 6 小时（毫秒） */
  SIX_HOURS: 6 * 60 * 60 * 1000,
  
  /** 1 天（毫秒） */
  ONE_DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * 缓存时长常量
 */
export const CACHE_DURATIONS = {
  /** 天气缓存：30 分钟 */
  WEATHER: DURATIONS.THIRTY_MINUTES,
  
  /** Unsplash 壁纸缓存：1 小时 */
  WALLPAPER_UNSPLASH: DURATIONS.ONE_HOUR,
  
  /** Bing 壁纸缓存：6 小时 */
  WALLPAPER_BING: DURATIONS.SIX_HOURS,
} as const;

/**
 * 重试配置常量
 */
export const RETRY_CONFIG = {
  /** 初始延迟：1 秒 */
  INITIAL_DELAY: DURATIONS.ONE_SECOND,
  
  /** 最大延迟：30 秒 */
  MAX_DELAY: DURATIONS.THIRTY_SECONDS,
  
  /** 最大重试次数 */
  MAX_RETRIES: 3,
  
  /** 退避因子 */
  BACKOFF_FACTOR: 2,
} as const;

/**
 * 写锁时长常量
 */
export const LOCK_DURATIONS = {
  /** 批量操作写锁：3 秒 */
  BATCH_WRITE: DURATIONS.THREE_SECONDS,
  
  /** 浏览器书签写锁：2 秒 */
  BROWSER_BOOKMARK_WRITE: DURATIONS.TWO_SECONDS,
} as const;
