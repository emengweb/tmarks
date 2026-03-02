/**
 * Chrome Storage 统一工具函数
 * 简化 chrome.storage.local 的操作并提供类型安全
 */

import { logger } from './logger';

/**
 * 从 chrome.storage.local 获取数据
 */
export async function getStorageItem<T>(key: string): Promise<T | null> {
  try {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? null;
  } catch (error) {
    logger.error(`Failed to get storage item: ${key}`, error);
    return null;
  }
}

/**
 * 从 chrome.storage.local 获取多个数据
 */
export async function getStorageItems<T extends Record<string, unknown>>(
  keys: string[]
): Promise<Partial<T>> {
  try {
    const result = await chrome.storage.local.get(keys);
    return result as Partial<T>;
  } catch (error) {
    logger.error('Failed to get storage items:', keys, error);
    return {};
  }
}

/**
 * 设置 chrome.storage.local 数据
 */
export async function setStorageItem<T>(key: string, value: T): Promise<boolean> {
  try {
    await chrome.storage.local.set({ [key]: value });
    return true;
  } catch (error) {
    logger.error(`Failed to set storage item: ${key}`, error);
    return false;
  }
}

/**
 * 设置多个 chrome.storage.local 数据
 */
export async function setStorageItems(items: Record<string, unknown>): Promise<boolean> {
  try {
    await chrome.storage.local.set(items);
    return true;
  } catch (error) {
    logger.error('Failed to set storage items:', error);
    return false;
  }
}

/**
 * 删除 chrome.storage.local 数据
 */
export async function removeStorageItem(key: string): Promise<boolean> {
  try {
    await chrome.storage.local.remove(key);
    return true;
  } catch (error) {
    logger.error(`Failed to remove storage item: ${key}`, error);
    return false;
  }
}

/**
 * 删除多个 chrome.storage.local 数据
 */
export async function removeStorageItems(keys: string[]): Promise<boolean> {
  try {
    await chrome.storage.local.remove(keys);
    return true;
  } catch (error) {
    logger.error('Failed to remove storage items:', keys, error);
    return false;
  }
}

/**
 * 获取缓存数据（带过期时间检查）
 */
export async function getCachedItem<T>(
  key: string,
  maxAgeMs: number
): Promise<T | null> {
  try {
    const result = await chrome.storage.local.get(key);
    const cached = result[key] as { data: T; timestamp: number } | undefined;
    
    if (cached && cached.timestamp) {
      const age = Date.now() - cached.timestamp;
      if (age < maxAgeMs) {
        return cached.data;
      }
    }
    return null;
  } catch (error) {
    logger.error(`Failed to get cached item: ${key}`, error);
    return null;
  }
}

/**
 * 设置缓存数据（带时间戳）
 */
export async function setCachedItem<T>(key: string, data: T): Promise<boolean> {
  try {
    const cached = {
      data,
      timestamp: Date.now(),
    };
    await chrome.storage.local.set({ [key]: cached });
    return true;
  } catch (error) {
    logger.error(`Failed to set cached item: ${key}`, error);
    return false;
  }
}
