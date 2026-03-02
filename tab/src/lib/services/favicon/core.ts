/**
 * Favicon 核心功能
 */

import type { FaviconOptions, FaviconResult } from './types';
import { getAvailableSources } from './sources';
import { extractDomain, blobToBase64, compressImage } from './utils';

export function getFaviconUrl(options: FaviconOptions): string {
  const { url, domain, size = 32, sources } = options;
  const targetDomain = domain || extractDomain(url);
  
  const availableSources = getAvailableSources(sources);
  
  if (availableSources.length === 0) {
    return `${url}/favicon.ico`;
  }

  const primarySource = availableSources[0];
  return primarySource.urlTemplate
    .replace('{domain}', targetDomain)
    .replace('{size}', size.toString())
    .replace('{url}', url);
}

export async function fetchFavicon(options: FaviconOptions): Promise<FaviconResult | null> {
  const { url, domain, size = 32, sources } = options;
  const targetDomain = domain || extractDomain(url);
  
  const availableSources = getAvailableSources(sources);

  for (const source of availableSources) {
    try {
      const faviconUrl = source.urlTemplate
        .replace('{domain}', targetDomain)
        .replace('{size}', size.toString())
        .replace('{url}', url);

      const response = await fetch(faviconUrl);
      
      if (response.ok) {
        const blob = await response.blob();
        const dataUrl = await blobToBase64(blob);
        
        return {
          url: faviconUrl,
          source: source.id,
          dataUrl,
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch favicon from ${source.id}:`, error);
    }
  }

  return null;
}

export async function downloadFavicon(
  url: string,
  options: {
    compress?: boolean;
    maxSizeKB?: number;
    timeout?: number;
  } = {}
): Promise<string | null> {
  const { compress = true, maxSizeKB = 10, timeout = 5000 } = options;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const faviconUrl = getFaviconUrl({ url });
    const response = await fetch(faviconUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const blob = await response.blob();

    if (compress) {
      return await compressImage(blob, maxSizeKB);
    }

    return await blobToBase64(blob);
  } catch (error) {
    console.error('Failed to download favicon:', error);
    return null;
  }
}
