// ============ Bookmark Site API ============

export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
}

export interface TagsAPIResponse {
  tags: Array<{
    id: string;
    name: string;
    color?: string;
    count?: number;
    createdAt: string;
  }>;
  total: number;
}

export interface BookmarksAPIResponse {
  bookmarks: Array<{
    id: string;
    url: string;
    title: string;
    description?: string;
    tags: string[];
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface SyncResult {
  success: boolean;
  duration?: number;
  stats?: {
    tags: number;
    bookmarks: number;
  };
  error?: string;
}
