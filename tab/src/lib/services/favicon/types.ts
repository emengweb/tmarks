/**
 * Favicon 类型定义
 */

export interface FaviconSource {
  id: string;
  name: string;
  urlTemplate: string;
  priority: number;
  requiresNetwork: boolean;
  available: boolean;
}

export interface FaviconOptions {
  url: string;
  domain?: string;
  size?: number;
  sources?: string[];
}

export interface FaviconResult {
  url: string;
  source: string;
  dataUrl?: string;
}

export interface BatchDownloadOptions {
  urls: string[];
  maxConcurrent?: number;
  timeout?: number;
  compress?: boolean;
  maxSizeKB?: number;
  onProgress?: (completed: number, total: number, current: string) => void;
  onError?: (url: string, error: Error) => void;
}

export interface BatchDownloadResult {
  successful: Array<{ url: string; dataUrl: string; source: string }>;
  failed: Array<{ url: string; error: string }>;
  total: number;
  successCount: number;
  failureCount: number;
}
