/**
 * 表单状态管理
 */

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { db } from '@/lib/db'
import { DEFAULT_PROMPT_TEMPLATE } from '@/lib/constants/prompts'
import { NEWTAB_FOLDER_PROMPT_TEMPLATE } from '@/lib/constants/newtabPrompts'
import { AI_SERVICE_URLS } from '@/lib/constants/urls'
import type { AIProvider } from '@/types'
import type { OptionsFormData, FormStats } from './types'

export function useFormState() {
  const { config, loadConfig } = useAppStore()

  const [formData, setFormData] = useState<OptionsFormData>({
    theme: 'auto',
    themeStyle: 'default',
    aiProvider: 'openai',
    apiKey: '',
    apiUrl: '',
    aiModel: '',
    bookmarkApiUrl: '',
    bookmarkApiKey: '',
    enableCustomPrompt: false,
    customPrompt: DEFAULT_PROMPT_TEMPLATE,
    maxSuggestedTags: 5,
    enableAI: true,
    defaultIncludeThumbnail: true,
    defaultCreateSnapshot: false,
    defaultIsPublic: true,
    tagTheme: 'classic',
    newtabFolderRecommendCount: 10,
    enableNewtabAI: true,
    enableNewtabFolderPrompt: false,
    newtabFolderPrompt: NEWTAB_FOLDER_PROMPT_TEMPLATE,
  })

  const [stats, setStats] = useState<FormStats>({
    tags: 0,
    bookmarks: 0,
    lastSync: 0,
  })

  const getDefaultApiUrl = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai':
        return AI_SERVICE_URLS.OPENAI
      case 'deepseek':
        return AI_SERVICE_URLS.DEEPSEEK
      case 'siliconflow':
        return AI_SERVICE_URLS.SILICONFLOW
      default:
        return ''
    }
  }

  useEffect(() => {
    const init = async () => {
      await loadConfig()
      const dbStats = await db.getStats()
      setStats(dbStats)
    }

    init()
  }, [])

  useEffect(() => {
    if (!config) {
      return
    }

    const currentProvider = config.aiConfig.provider
    const currentApiKey = config.aiConfig.apiKeys[currentProvider] || ''
    const savedApiUrl = config.aiConfig.apiUrls?.[currentProvider] || ''
    const currentApiUrl = savedApiUrl || getDefaultApiUrl(currentProvider)

    setFormData((prev) => ({
      ...prev,
      theme: config.preferences.theme ?? 'auto',
      themeStyle: config.preferences.themeStyle ?? 'default',
      aiProvider: currentProvider,
      apiKey: currentApiKey,
      apiUrl: currentApiUrl,
      aiModel: config.aiConfig.model || '',
      bookmarkApiUrl: config.bookmarkSite.apiUrl,
      bookmarkApiKey: config.bookmarkSite.apiKey,
      enableCustomPrompt: config.aiConfig.enableCustomPrompt || false,
      customPrompt: config.aiConfig.customPrompt || prev.customPrompt,
      maxSuggestedTags: config.preferences.maxSuggestedTags,
      enableAI: config.preferences.enableAI ?? true,
      defaultIncludeThumbnail: config.preferences.defaultIncludeThumbnail ?? true,
      defaultCreateSnapshot: config.preferences.defaultCreateSnapshot ?? false,
      defaultIsPublic: config.preferences.defaultIsPublic ?? true,
      tagTheme: config.preferences.tagTheme ?? 'classic',
      newtabFolderRecommendCount: Math.min(20, Math.max(1, Number(config.preferences.newtabFolderRecommendCount ?? 10))),
      enableNewtabAI: config.preferences.enableNewtabAI ?? true,
      enableNewtabFolderPrompt: config.preferences.enableNewtabFolderPrompt ?? false,
      newtabFolderPrompt: config.preferences.newtabFolderPrompt ?? NEWTAB_FOLDER_PROMPT_TEMPLATE,
      maxImportGroups: config.aiConfig.maxImportGroups ?? 7,
    }))
  }, [config])

  const handleProviderChange = (newProvider: AIProvider) => {
    const newApiKey = config?.aiConfig.apiKeys[newProvider] || ''
    const savedApiUrl = config?.aiConfig.apiUrls?.[newProvider] || ''
    const newApiUrl = savedApiUrl || getDefaultApiUrl(newProvider)

    setFormData((prev) => ({
      ...prev,
      aiProvider: newProvider,
      apiKey: newApiKey,
      apiUrl: newApiUrl,
    }))
  }

  return {
    formData,
    setFormData,
    stats,
    setStats,
    handleProviderChange,
    getDefaultApiUrl,
  }
}
