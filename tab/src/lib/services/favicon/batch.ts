/**
 * Favicon 批量下载
 */

import type { BatchDownloadOptions, BatchDownloadResult } from './types';
import { downloadFavicon } from './core';

export async function batchDownloadFavicons(
  options: BatchDownloadOptions
): Promise<BatchDownloadResult> {
  const {
    urls,
    maxConcurrent = 5,
    timeout = 5000,
    compress = true,
    maxSizeKB = 10,
    onProgress,
    onError,
  } = options;

  const successful: Array<{ url: string; dataUrl: string; source: string }> = [];
  const failed: Array<{ url: string; error: string }> = [];
  let completed = 0;

  const processUrl = async (url: string) => {
    try {
      const dataUrl = await downloadFavicon(url, { compress, maxSizeKB, timeout });
      
      if (dataUrl) {
        successful.push({ url, dataUrl, source: 'google' });
      } else {
        failed.push({ url, error: 'Failed to download' });
        onError?.(url, new Error('Failed to download'));
      }
    } catch (error) {
      failed.push({ url, error: error instanceof Error ? error.message : 'Unknown error' });
      onError?.(url, error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      completed++;
      onProgress?.(completed, urls.length, url);
    }
  };

  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    chunks.push(urls.slice(i, i + maxConcurrent));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(processUrl));
  }

  return {
    successful,
    failed,
    total: urls.length,
    successCount: successful.length,
    failureCount: failed.length,
  };
}
