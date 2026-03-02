/**
 * Favicon 工具函数 - 兼容层
 */

import {
  getFaviconUrl as getUrl,
  downloadFavicon as download,
  batchDownloadFavicons as batchDownload,
} from '@/lib/services/favicon';
import { getCachedFavicon } from '../services/favicon-cache';

export async function getFaviconUrlAsync(shortcut: { 
  url: string; 
  favicon?: string; 
  faviconBase64?: string;
}): Promise<string> {
  try {
    const cached = await getCachedFavicon(shortcut.url);
    if (cached) return cached;
  } catch (error) {
    // ignore
  }

  if (shortcut.faviconBase64) return shortcut.faviconBase64;
  if (shortcut.favicon && !(shortcut.favicon.includes('icon.ooo') && shortcut.favicon.includes('&sz='))) {
    return shortcut.favicon;
  }

  return getUrl({ url: shortcut.url, size: 64 });
}

export function getFaviconUrl(shortcut: { 
  url: string; 
  favicon?: string; 
  faviconBase64?: string;
}): string {
  if (shortcut.faviconBase64) return shortcut.faviconBase64;
  if (shortcut.favicon && !(shortcut.favicon.includes('icon.ooo') && shortcut.favicon.includes('&sz='))) {
    return shortcut.favicon;
  }
  return getUrl({ url: shortcut.url, size: 64 });
}

export async function downloadFavicon(url: string, maxSizeKB: number = 10): Promise<string | null> {
  return download(url, { maxSizeKB, compress: true });
}

export async function batchDownloadFavicons(
  shortcuts: Array<{ id: string; url: string; favicon?: string; faviconBase64?: string }>,
  onProgress?: (current: number, total: number) => void
): Promise<Map<string, string>> {
  const urls = shortcuts.map(s => s.url);
  const result = await batchDownload({
    urls,
    onProgress: onProgress ? (completed: number, total: number) => onProgress(completed, total) : undefined,
  });
  const successMap = new Map<string, string>();
  result.successful.forEach(item => successMap.set(item.url, item.dataUrl));
  return successMap;
}
