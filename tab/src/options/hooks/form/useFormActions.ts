/**
 * 表单操作逻辑
 */

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { db } from '@/lib/db'
import { TIMEOUTS } from '@/lib/constants/timeouts'
import { t } from '@/lib/i18n'
import { DEFAULT_PROMPT_TEMPLATE } from '@/lib/constants/prompts'
import { NEWTAB_FOLDER_PROMPT_TEMPLATE } from '@/lib/constants/newtabPrompts'
import type { AIProvider, AIConnectionInfo } from '@/types'
import type { OptionsFormData, FormStats } from './types'

export function useFormActions(
  formData: OptionsFormData,
  setFormData: React.Dispatch<React.SetStateAction<OptionsFormData>>,
  setStats: React.Dispatch<React.SetStateAction<FormStats>>,
  savedConnections: Partial<Record<AIProvider, AIConnectionInfo[]>>,
  setSavedConnections: (connections: Partial<Record<AIProvider, AIConnectionInfo[]>>)=> void,
  upsertConnection: (
    existing: Partial<Record<AIProvider, AIConnectionInfo[]>>,
    provider: AIProvider,
    connection: AIConnectionInfo
  ) => Partial<Record<AIProvider, AIConnectionInfo[]>>,
  removeConnection: (
    existing: Partial<Record<AIProvider, AIConnectionInfo[]>>,
    provider: AIProvider,
    target: AIConnectionInfo
  ) => Partial<Record<AIProvider, AIConnectionInfo[]>>
) {
  const { config, saveConfig, syncCache, setError, setSuccessMessage, setLoading } = useAppStore()
  const [isTesting, setIsTesting] = useState(false)

  const handleSave = async () => {
    try {
      await saveConfig({
        aiConfig: {
          provider: formData.aiProvider,
          apiKeys: {
            ...config?.aiConfig.apiKeys,
            [formData.aiProvider]: formData.apiKey,
          },
          apiUrls: {
            ...config?.aiConfig.apiUrls,
            [formData.aiProvider]: formData.apiUrl,
          },
          model: formData.aiModel,
          enableCustomPrompt: formData.enableCustomPrompt,
          customPrompt: formData.customPrompt,
          savedConnections,
          maxImportGroups: formData.maxImportGroups || 7,
        },
        bookmarkSite: {
          apiUrl: formData.bookmarkApiUrl,
          apiKey: formData.bookmarkApiKey,
        },
        preferences: {
          theme: formData.theme,
          themeStyle: formData.themeStyle,
          autoSync: config?.preferences.autoSync ?? true,
          syncInterval: config?.preferences.syncInterval ?? 24,
          maxSuggestedTags: formData.maxSuggestedTags,
          enableAI: formData.enableAI,
          defaultIncludeThumbnail: formData.defaultIncludeThumbnail,
          defaultCreateSnapshot: formData.defaultCreateSnapshot,
          defaultIsPublic: formData.defaultIsPublic,
          tagTheme: formData.tagTheme,
          newtabFolderRecommendCount: Math.min(20, Math.max(1, Number(formData.newtabFolderRecommendCount ?? 10))),
          enableNewtabAI: formData.enableNewtabAI,
          enableNewtabFolderPrompt: formData.enableNewtabFolderPrompt,
          newtabFolderPrompt: formData.newtabFolderPrompt,
        },
      })

      setSuccessMessage(t('msg_settings_saved'))
      setTimeout(() => setSuccessMessage(null), TIMEOUTS.NOTIFICATION)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error_save_failed'))
    }
  }

  const handleSync = async () => {
    try {
      setLoading(true)
      await syncCache()
      const dbStats = await db.getStats()
      setStats(dbStats)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error_save_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleTestAPI = async () => {
    try {
      setIsTesting(true)
      setError(null)

      const { getAIProvider } = await import('@/lib/providers')
      const provider = getAIProvider(formData.aiProvider)

      const testRequest = {
        page: {
          title: 'Claude Code - AI Programming Assistant',
          url: 'https://claude.ai',
          description: 'Claude is a powerful AI programming assistant',
          content: 'Claude Code is an intelligent programming tool by Anthropic, supporting multiple programming languages and frameworks.',
        },
        context: {
          existingTags: ['Dev Tools', 'AI', 'Programming', 'Productivity'],
          recentBookmarks: [],
        },
        options: {
          maxTags: 3,
          preferExisting: true,
        },
      }

      const response = await provider.generateTags(
        testRequest,
        formData.apiKey,
        formData.aiModel || undefined,
        formData.apiUrl || undefined,
        formData.enableCustomPrompt ? formData.customPrompt : undefined
      )

      setSuccessMessage(
        t('api_test_success', [String(response.suggestedTags.length), response.suggestedTags.map((tag: any) => tag.name).join(', ')])
      )
      setTimeout(() => setSuccessMessage(null), TIMEOUTS.LONG)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('api_test_failed'))
    } finally {
      setIsTesting(false)
    }
  }

  const handleReset = () => {
    if (confirm(t('confirm_reset'))) {
      setFormData({
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
      setSuccessMessage(t('msg_settings_reset'))
      setTimeout(() => setSuccessMessage(null), TIMEOUTS.NOTIFICATION)
    }
  }

  const handleSaveConnectionPreset = (openModal: (label: string) => void) => {
    const trimmedKey = formData.apiKey.trim()
    if (!trimmedKey) {
      setError(t('error_api_key_required'))
      return
    }

    const defaultName = t('preset_default_name', String((savedConnections[formData.aiProvider]?.length || 0) + 1))
    openModal(defaultName)
  }

  const handleConfirmSaveConnectionPreset = async (
    presetLabel: string,
    setPresetError: (error: string | null) => void,
    setSavingPreset: (saving: boolean) => void,
    closeModal: () => void
  ) => {
    const trimmedKey = formData.apiKey.trim()
    if (!trimmedKey) {
      setPresetError(t('error_api_key_required'))
      return
    }

    const trimmedLabel = presetLabel.trim()
    if (!trimmedLabel) {
      setPresetError(t('error_preset_name_required'))
      return
    }

    if (!config) {
      setError(t('error_config_not_loaded'))
      closeModal()
      return
    }

    setSavingPreset(true)
    setPresetError(null)

    const connection: AIConnectionInfo = {
      apiUrl: formData.apiUrl,
      apiKey: trimmedKey,
      model: formData.aiModel,
      label: trimmedLabel,
      provider: formData.aiProvider,
    }

    const previous = savedConnections
    const updated = upsertConnection(previous, formData.aiProvider, connection)
    setSavedConnections(updated)

    try {
      await saveConfig({
        aiConfig: {
          ...config.aiConfig,
          savedConnections: updated,
        },
      })
      setSuccessMessage(t('msg_preset_saved', trimmedLabel))
      setTimeout(() => setSuccessMessage(null), TIMEOUTS.NOTIFICATION)
      closeModal()
    } catch (e) {
      setSavedConnections(previous)
      setPresetError(e instanceof Error ? e.message : t('error_save_preset_failed'))
    } finally {
      setSavingPreset(false)
    }
  }

  const handleApplySavedConnection = async (connection: AIConnectionInfo, providerOverride?: AIProvider) => {
    const targetProvider = providerOverride || connection.provider || formData.aiProvider

    setFormData({
      ...formData,
      aiProvider: targetProvider,
      apiUrl: connection.apiUrl || '',
      apiKey: connection.apiKey || '',
      aiModel: connection.model || '',
    })

    try {
      await saveConfig({
        aiConfig: {
          provider: targetProvider,
          apiKeys: {
            ...config?.aiConfig.apiKeys,
            [targetProvider]: connection.apiKey || '',
          },
          apiUrls: {
            ...config?.aiConfig.apiUrls,
            [targetProvider]: connection.apiUrl || '',
          },
          model: connection.model || '',
          enableCustomPrompt: config?.aiConfig.enableCustomPrompt || false,
          customPrompt: config?.aiConfig.customPrompt || '',
          savedConnections,
        },
        bookmarkSite: config?.bookmarkSite || { apiUrl: '', apiKey: '' },
        preferences: config?.preferences || {
          theme: 'auto',
          themeStyle: 'default',
          autoSync: true,
          syncInterval: 24,
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
        },
      })

      setSuccessMessage(t('msg_config_applied', connection.label || t('options_unnamed_config')))
      setTimeout(() => setSuccessMessage(null), TIMEOUTS.NOTIFICATION)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error_save_failed'))
    }
  }

  const handleDeleteSavedConnection = async (connection: AIConnectionInfo, providerOverride?: AIProvider) => {
    const provider = providerOverride || connection.provider || formData.aiProvider
    if (!provider) {
      setError(t('error_provider_unknown'))
      return
    }

    const previous = savedConnections
    const updated = removeConnection(previous, provider, connection)
    setSavedConnections(updated)

    try {
      if (!config) {
        throw new Error(t('error_config_not_loaded'))
      }
      await saveConfig({
        aiConfig: {
          ...config.aiConfig,
          savedConnections: updated,
        },
      })
      setSuccessMessage(t('msg_connection_deleted'))
      setTimeout(() => setSuccessMessage(null), TIMEOUTS.NOTIFICATION)
    } catch (e) {
      setSavedConnections(previous)
      setError(e instanceof Error ? e.message : t('error_delete_connection_failed'))
    }
  }

  const formatDate = (timestamp: number) => {
    if (!timestamp) return t('never_synced')
    return new Date(timestamp).toLocaleString()
  }

  return {
    isTesting,
    handleSave,
    handleSync,
    handleTestAPI,
    handleReset,
    handleSaveConnectionPreset,
    handleConfirmSaveConnectionPreset,
    handleApplySavedConnection,
    handleDeleteSavedConnection,
    formatDate,
  }
}
