/**
 * 进度持久化 Hook
 */

import { useEffect, useState } from 'react'
import type { AIOrganizeState, AIOrganizeConfig, ProcessStatus } from './useAIOrganizeState'
import type { EditableBookmark } from '../EditableBookmarkTable'
import { logger } from '@/lib/utils/logger'

interface ProgressData {
  urls: string[]
  bookmarks: EditableBookmark[]
  progress: AIOrganizeState['progress']
  errors: AIOrganizeState['errors']
  status: ProcessStatus
  timestamp: number
  options: Partial<AIOrganizeConfig>
}

const STORAGE_KEY = 'ai_organize_progress'
const EXPIRY_TIME = 3600000 // 1 小时

export function useProgressPersistence(
  urls: string[],
  state: AIOrganizeState,
  config: AIOrganizeConfig,
  onRestore: (data: ProgressData) => void
) {
  const [savedData, setSavedData] = useState<ProgressData | null>(null)
  const [showRestorePrompt, setShowRestorePrompt] = useState(false)
  // 保存进度
  const saveProgress = () => {
    const progressData: ProgressData = {
      urls,
      bookmarks: state.realtimeBookmarks,
      progress: state.progress,
      errors: state.errors,
      status: state.status,
      timestamp: Date.now(),
      options: {
        concurrency: config.concurrency,
        batchMode: config.batchMode,
        batchSize: config.batchSize,
        useCustomStyle: config.useCustomStyle,
        customStyle: config.customStyle,
        titleLength: config.titleLength,
        descriptionDetail: config.descriptionDetail,
        tagCountMin: config.tagCountMin,
        tagCountMax: config.tagCountMax,
        language: config.language,
        temperature: config.temperature,
        batchDelay: config.batchDelay
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData))
  }

  // 恢复进度
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY)
    if (!savedProgress) return

    try {
      const data: ProgressData = JSON.parse(savedProgress)
      
      // 检查是否过期
      if (Date.now() - data.timestamp > EXPIRY_TIME) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }

      // 显示非阻拦式提示
      setSavedData(data)
      setShowRestorePrompt(true)
    } catch (error) {
      logger.error('Failed to restore AI organize progress', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // 处理恢复
  const handleRestore = () => {
    if (savedData) {
      onRestore(savedData)
      setShowRestorePrompt(false)
      setSavedData(null)
    }
  }

  // 处理忽略
  const handleIgnore = () => {
    localStorage.removeItem(STORAGE_KEY)
    setShowRestorePrompt(false)
    setSavedData(null)
  }

  // 处理中自动保存
  useEffect(() => {
    if (state.status === 'processing' && state.realtimeBookmarks.length > 0) {
      saveProgress()
    }
  }, [state.realtimeBookmarks, state.progress, state.status])

  return {
    saveProgress,
    clearProgress: () => localStorage.removeItem(STORAGE_KEY),
    showRestorePrompt,
    savedData,
    handleRestore,
    handleIgnore
  }
}
