import type { AIConfig, AIProvider } from './ai';

// ============ Configuration Models ============

export interface BookmarkSiteConfig {
  apiUrl: string;
  apiKey: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  themeStyle?: 'default' | 'bw' | 'tmarks';
  autoSync: boolean;
  syncInterval: number;
  maxSuggestedTags: number;
  enableAI: boolean; // 是否启用 AI 标签推荐
  defaultIncludeThumbnail: boolean; // 默认是否包含封面图
  defaultCreateSnapshot: boolean; // 默认是否创建快照
  defaultIsPublic?: boolean; // 默认是否公开（默认 true）
  tagTheme?: 'classic' | 'mono' | 'bw';

  // NewTab：Popup「保存到 NewTab」的文件夹 AI 推荐数量（10-20）
  newtabFolderRecommendCount?: number;

  // NewTab：是否启用"保存到 NewTab"的 AI 文件夹推荐
  enableNewtabAI?: boolean;

  enableNewtabFolderPrompt?: boolean;
  newtabFolderPrompt?: string;
}

export interface StorageConfig {
  aiConfig: AIConfig;
  bookmarkSite: BookmarkSiteConfig;
  preferences: UserPreferences;
}

export type { AIConfig, AIProvider };
