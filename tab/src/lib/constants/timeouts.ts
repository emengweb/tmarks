/**
 * 超时时间常量定义
 * 统一管理所有超时时间，避免魔法数字
 */

export const TIMEOUTS = {
  /** 极短延迟 - 用于快速 UI 反馈 */
  VERY_SHORT: 100,
  
  /** 短延迟 - 用于 UI 动画和快速操作 */
  SHORT: 200,
  
  /** 动画延迟 - 用于模态框、弹窗等动画 */
  ANIMATION: 150,
  
  /** 通知显示时间 */
  NOTIFICATION: 2000,
  
  /** 中等延迟 - 用于一般操作 */
  MEDIUM: 3000,
  
  /** 长延迟 - 用于需要等待的操作 */
  LONG: 5000,
  
  /** AI 推荐超时 */
  AI_RECOMMEND: 35000,
  
  /** 拖拽防抖延迟 */
  DRAG_DEBOUNCE: 200,
  
  /** 刷新防抖延迟 */
  REFRESH_DEBOUNCE: 500,
  
  /** 批处理延迟 - 用于 AI 批量处理 */
  BATCH_DELAY: 500,
  
  /** 页面加载延迟 - 用于等待脚本注入 */
  PAGE_LOAD: 300,
} as const;
