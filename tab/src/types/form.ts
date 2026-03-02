/**
 * 表单相关类型定义
 */

import type { AIProvider } from './ai';

// Options 表单数据类型
export interface OptionsFormData {
  theme: 'light' | 'dark' | 'auto';
  themeStyle: 'default' | 'bw' | 'tmarks';
  aiProvider: AIProvider;
  apiKey: string;
  apiUrl: string;
  aiModel: string;
  bookmarkApiUrl: string;
  bookmarkApiKey: string;
  enableCustomPrompt: boolean;
  customPrompt: string;
  enableAI: boolean;
  enableNewtabAI: boolean;
  newtabFolderPrompt: string;
  tagTheme: 'classic' | 'mono' | 'bw';
  maxSuggestedTags: number;
  defaultIncludeThumbnail: boolean;
  defaultCreateSnapshot: boolean;
  defaultIsPublic: boolean;
  newtabFolderRecommendCount: number;
  enableNewtabFolderPrompt: boolean;
}

// 部分表单数据更新函数类型
export type FormDataSetter = (updater: Partial<OptionsFormData> | ((prev: OptionsFormData) => OptionsFormData)) => void;
