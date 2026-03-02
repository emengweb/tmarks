/**
 * URL 处理工具函数
 * 统一处理 URL 相关操作
 */

import { logger } from './logger';

/**
 * 安全地从 URL 提取域名
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    logger.warn('Failed to extract domain from URL:', url, error);
    return '';
  }
}

/**
 * 安全地从 URL 提取主机名（别名）
 */
export const getHostname = extractDomain;

/**
 * 验证 URL 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 规范化 URL（确保有协议）
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  return `https://${trimmed}`;
}

/**
 * 将相对 URL 转换为绝对 URL
 */
export function toAbsoluteUrl(url: string, baseUrl?: string): string {
  try {
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.href : '');
    return new URL(url, base).href;
  } catch (error) {
    logger.warn('Failed to convert to absolute URL:', url, error);
    return url;
  }
}

/**
 * 检查 URL 是否为有效的 HTTP(S) URL
 */
export function isHttpUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 从 URL 获取 Favicon URL（Google 服务）
 */
export function getGoogleFaviconUrl(url: string, size: number = 64): string {
  const domain = extractDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 * 从 URL 获取通用 Favicon URL
 */
export function getFaviconUrl(url: string, service: 'google' | 'duckduckgo' = 'google', size: number = 64): string {
  const domain = extractDomain(url);
  if (!domain) return '';
  
  if (service === 'duckduckgo') {
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  }
  
  return getGoogleFaviconUrl(url, size);
}

/**
 * 检查 URL 是否为本地主机
 */
export function isLocalhost(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * 从 URL 获取路径（不含查询参数和哈希）
 */
export function getPathname(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return '';
  }
}

/**
 * 从 URL 获取查询参数对象
 */
export function getQueryParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return {};
  }
}

/**
 * 安全地创建 URL 对象
 */
export function safeCreateUrl(url: string, base?: string): URL | null {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
}
