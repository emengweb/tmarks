/**
 * Options 表单类型定义
 */

import type { AIProvider, AIConnectionInfo } from '@/types'

export interface OptionsFormData {
  theme: 'light' | 'dark' | 'auto'
  themeStyle: 'default' | 'bw' | 'tmarks'
  aiProvider: AIProvider
  apiKey: string
  apiUrl: string
  aiModel: string
  bookmarkApiUrl: string
  bookmarkApiKey: string
  enableCustomPrompt: boolean
  customPrompt: string
  maxSuggestedTags: number
  enableAI: boolean
  defaultIncludeThumbnail: boolean
  defaultCreateSnapshot: boolean
  defaultIsPublic: boolean
  tagTheme: 'classic' | 'mono' | 'bw'
  newtabFolderRecommendCount: number
  enableNewtabAI: boolean
  enableNewtabFolderPrompt: boolean
  newtabFolderPrompt: string
  maxImportGroups?: number
}

export interface FormStats {
  tags: number
  bookmarks: number
  lastSync: number
}

export interface SavedConnectionsState {
  savedConnections: Partial<Record<AIProvider, AIConnectionInfo[]>>
  isPresetModalOpen: boolean
  presetLabel: string
  isSavingPreset: boolean
  presetError: string | null
}

export interface ModelFetchState {
  availableModels: string[]
  isFetchingModels: boolean
  modelFetchError: string | null
  modelFetchNonce: number
}
