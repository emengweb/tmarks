// ============ Bookmark Models ============

export interface Tag {
  id?: number;
  name: string;
  color?: string;
  count?: number;
  createdAt: number;
}

// ExistingTag 用于 UI 显示（从 API 返回）
export interface ExistingTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface Bookmark {
  id?: number;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: number;
  remoteId?: string;
}

export interface BookmarkInput {
  url: string;
  title: string;
  description?: string;
  tags: string[];
  thumbnail?: string;
  favicon?: string;
  createSnapshot?: boolean;
  is_public?: boolean;
}

export interface SaveResult {
  success: boolean;
  bookmarkId?: string;
  existingBookmark?: {
    id: string;
    title: string;
    url: string;
    tags: Array<{ id: string; name: string; color: string | null }>;
    has_snapshot?: boolean;
    snapshot_count?: number;
    created_at: string;
    needsDialog?: boolean;
  };
  offline?: boolean;
  message?: string;
  error?: string;
}
