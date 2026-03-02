/**
 * 统一错误处理工具
 */

import { t } from '../i18n';
import { logger } from './logger';

/**
 * 错误类型定义
 */
export type ErrorType =
  | 'NETWORK_ERROR'
  | 'SYNC_ERROR'
  | 'SAVE_ERROR'
  | 'DELETE_ERROR'
  | 'UPDATE_ERROR'
  | 'PARSE_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * 获取错误消息
 */
export function getErrorMessage(type: ErrorType): string {
  const messages: Record<ErrorType, string> = {
    NETWORK_ERROR: t('error_network'),
    SYNC_ERROR: t('error_sync_failed'),
    SAVE_ERROR: t('error_save_bookmark_failed'),
    DELETE_ERROR: t('error_sync_delete_failed'),
    UPDATE_ERROR: t('error_sync_update_failed'),
    PARSE_ERROR: t('error_parse_failed'),
    VALIDATION_ERROR: t('error_validation_failed'),
    UNKNOWN_ERROR: t('error_unknown'),
  };
  return messages[type] || messages.UNKNOWN_ERROR;
}

/**
 * 从错误对象提取消息
 * 统一处理 error instanceof Error ? error.message : fallback 模式
 */
export function extractErrorMessage(error: unknown, fallback?: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback || 'Unknown error';
}

/**
 * 处理错误并返回用户友好的消息
 */
export function handleError(
  error: unknown,
  type: ErrorType = 'UNKNOWN_ERROR',
  showToast = true
): string {
  const message = extractErrorMessage(error, getErrorMessage(type));
  
  // 记录错误日志
  logger.error(`[${type}]`, error);
  
  // 显示 Toast 通知（如果需要）
  if (showToast && typeof window !== 'undefined') {
    // 这里可以集成 Toast 通知系统
    // showToast(message, 'error');
  }
  
  return message;
}

/**
 * 创建带错误消息的 Error 对象
 */
export function createError(error: unknown, prefix: string): Error {
  const message = extractErrorMessage(error);
  return new Error(`${prefix}: ${message}`);
}

/**
 * 安全地执行异步操作，返回结果或错误
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorType: ErrorType = 'UNKNOWN_ERROR'
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, errorType, false),
    };
  }
}

/**
 * 安全地执行同步操作，返回结果或错误
 */
export function safeSync<T>(
  fn: () => T,
  errorType: ErrorType = 'UNKNOWN_ERROR'
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: handleError(error, errorType, false),
    };
  }
}
