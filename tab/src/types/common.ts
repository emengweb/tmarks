// ============ Error Types ============

export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_INVALID = 'API_KEY_INVALID',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  BOOKMARK_SITE_ERROR = 'BOOKMARK_SITE_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ============ Message Types (for chrome.runtime.messaging) ============

export type MessageType =
  | 'EXTRACT_PAGE_INFO'
  | 'RECOMMEND_TAGS'
  | 'CREATE_SNAPSHOT'
  | 'SAVE_BOOKMARK'
  | 'SAVE_TO_NEWTAB'
  | 'IMPORT_ALL_BOOKMARKS_TO_NEWTAB'
  | 'IMPORT_URLS_TO_NEWTAB'
  | 'GET_NEWTAB_FOLDERS'
  | 'RECOMMEND_NEWTAB_FOLDER'
  | 'SYNC_CACHE'
  | 'GET_CONFIG'
  | 'GET_EXISTING_TAGS'
  | 'UPDATE_BOOKMARK_TAGS'
  | 'UPDATE_BOOKMARK_DESCRIPTION'
  | 'CAPTURE_PAGE'
  | 'CAPTURE_PAGE_V2'
  | 'PING'
  | 'REFRESH_PINNED_BOOKMARKS';

export interface CapturePageOptions {
  includeThumbnail?: boolean;
  createSnapshot?: boolean;
  generateTags?: boolean;
}

export interface Message<T = unknown> {
  type: MessageType;
  payload?: T;
  options?: CapturePageOptions;
}

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  html?: string; // For CAPTURE_PAGE response
  size?: number; // For CAPTURE_PAGE response
}

// ============ Page Info ============

export interface PageInfo {
  title: string;
  url: string;
  description?: string;
  content?: string;
  thumbnail?: string;
  thumbnails?: string[];
  favicon?: string;
}

// ============ Metadata ============

export interface Metadata {
  key: string;
  value: unknown;
  updatedAt: number;
}
