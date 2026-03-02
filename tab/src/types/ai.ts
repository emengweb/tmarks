import type { PageInfo } from './common';

// ============ AI Provider Types ============

export type AIProvider = 'openai' | 'claude' | 'deepseek' | 'zhipu' | 'modelscope' | 'siliconflow' | 'iflow' | 'custom';

export interface AIConnectionInfo {
  id?: string;
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  label?: string;
  provider?: AIProvider;
  lastUsedAt?: number;
}

export interface AIConfig {
  provider: AIProvider;
  apiKeys: {
    openai?: string;
    claude?: string;
    deepseek?: string;
    zhipu?: string;
    modelscope?: string;
    siliconflow?: string;
    iflow?: string;
    custom?: string;
  };
  apiUrls?: {
    openai?: string;
    claude?: string;
    deepseek?: string;
    zhipu?: string;
    modelscope?: string;
    siliconflow?: string;
    iflow?: string;
    custom?: string;
  };
  model?: string;
  customPrompt?: string;
  enableCustomPrompt?: boolean;
  savedConnections?: Partial<Record<AIProvider, AIConnectionInfo[]>>;
  maxImportGroups?: number; // AI 批量导入最多创建的分组数量，默认 7
}

// ============ AI Request/Response ============

export interface AIRequest {
  page: PageInfo;
  context: {
    existingTags: string[];
    recentBookmarks: Array<{
      title: string;
      tags: string[];
    }>;
  };
  options: {
    maxTags: number;
    preferExisting: boolean;
  };
}

export interface TagSuggestion {
  name: string;
  isNew: boolean;
  confidence: number;
}

export interface AIResponse {
  suggestedTags: TagSuggestion[];
  reasoning?: string;
  translatedTitle?: string;
  translatedDescription?: string;
}

export interface RecommendationResult {
  tags: TagSuggestion[];
  source: 'ai' | 'fallback';
  timestamp: number;
  message?: string | null;
}
