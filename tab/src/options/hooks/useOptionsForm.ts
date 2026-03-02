/**
 * Options 表单主 Hook（组合所有子 Hook）
 */

import { useAppStore } from '@/lib/store'
import { useFormState } from './form/useFormState'
import { useModelFetch } from './form/useModelFetch'
import { useSavedConnections } from './form/useSavedConnections'
import { useFormActions } from './form/useFormActions'
import { useTheme } from './form/useTheme'

export function useOptionsForm() {
  const { config, error, successMessage, isLoading, setError, setSuccessMessage } = useAppStore()

  // 表单状态
  const { formData, setFormData, stats, setStats, handleProviderChange } = useFormState()

  // 主题管理
  useTheme(formData.theme, formData.themeStyle)

  // 模型获取
  const {
    availableModels,
    isFetchingModels,
    modelFetchError,
    modelFetchSupported,
    refreshModelOptions,
    resetModelFetch,
  } = useModelFetch(formData.aiProvider, formData.apiUrl, formData.apiKey, (models) => {
    if (!formData.aiModel && models.length > 0) {
      setFormData((prev) => ({ ...prev, aiModel: models[0] }))
    }
  })

  // 保存的连接
  const {
    savedConnections,
    allSavedConnections,
    isPresetModalOpen,
    presetLabel,
    isSavingPreset,
    presetError,
    setSavedConnections,
    setPresetLabel,
    openPresetModal,
    closePresetModal,
    setPresetError,
    setSavingPreset,
    upsertSavedConnection,
    removeSavedConnection,
  } = useSavedConnections()

  // 表单操作
  const {
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
  } = useFormActions(
    formData,
    setFormData,
    setStats,
    savedConnections,
    setSavedConnections,
    upsertSavedConnection,
    removeSavedConnection
  )

  // 处理 provider 变更时重置模型
  const handleProviderChangeWithReset = (newProvider: any) => {
    handleProviderChange(newProvider)
    resetModelFetch()
  }

  return {
    config,
    error,
    successMessage,
    isLoading,
    setError,
    setSuccessMessage,

    formData,
    setFormData,

    stats,
    isTesting,

    availableModels,
    isFetchingModels,
    modelFetchError,
    modelFetchSupported,

    savedConnections,
    allSavedConnections,

    isPresetModalOpen,
    presetLabel,
    isSavingPreset,
    presetError,

    setPresetLabel,

    handleProviderChange: handleProviderChangeWithReset,
    refreshModelOptions,
    handleSave,
    handleSync,
    handleTestAPI,
    formatDate,
    handleReset,

    handleSaveConnectionPreset: () => handleSaveConnectionPreset(openPresetModal),
    handleConfirmSaveConnectionPreset: () =>
      handleConfirmSaveConnectionPreset(presetLabel, setPresetError, setSavingPreset, closePresetModal),
    handleClosePresetModal: () => {
      if (!isSavingPreset) {
        closePresetModal()
      }
    },
    handleApplySavedConnection,
    handleDeleteSavedConnection,
  }
}
