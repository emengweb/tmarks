/**
 * AI 整理事件处理器 Hook
 */

import { bookmarkOrganizer } from '@/lib/services/bookmark-organizer'
import { logger } from '@/lib/utils/logger'
import type { AIProvider } from '@/types'
import type { AIOrganizeState, AIOrganizeConfig, ProcessStatus } from './useAIOrganizeState'
import type { EditableBookmark } from '../EditableBookmarkTable'

interface HandlerOptions {
  urls: string[]
  provider: AIProvider
  apiKey: string
  model?: string
  apiUrl?: string
  existingTags: string[]
  existingFolders: string[]
  mode: 'tmarks' | 'newtab'
  state: AIOrganizeState
  config: AIOrganizeConfig
  setStatus: (status: ProcessStatus) => void
  setProgress: (progress: AIOrganizeState['progress']) => void
  setBookmarks: (bookmarks: EditableBookmark[]) => void
  setRealtimeBookmarks: (bookmarks: EditableBookmark[] | ((prev: EditableBookmark[]) => EditableBookmark[])) => void
  setErrors: (errors: Array<{ url: string; error: string }>) => void
  setSuggestedGroups: (groups: AIOrganizeState['suggestedGroups']) => void
  setIsPaused: (paused: boolean) => void
}

export function useAIOrganizeHandlers(options: HandlerOptions) {
  const {
    urls,
    provider,
    apiKey,
    model,
    apiUrl,
    existingTags,
    existingFolders,
    mode,
    state,
    config,
    setStatus,
    setProgress,
    setBookmarks,
    setRealtimeBookmarks,
    setErrors,
    setSuggestedGroups,
    setIsPaused
  } = options

  // 开始处理（方案 B：始终显示分组预览）
  const handleStart = async () => {
    // NewTab 模式：始终先推荐分组让用户确认
    if (mode === 'newtab') {
      setStatus('suggesting')
      try {
        // 合并已有分组和预定义分组作为 AI 参考
        const referenceFolders = config.predefinedFolders.length > 0
          ? [...new Set([...existingFolders, ...config.predefinedFolders])]
          : existingFolders
        
        const groups = await bookmarkOrganizer.suggestGroups(urls, {
          provider,
          apiKey,
          model,
          apiUrl,
          language: config.language,
          temperature: config.temperature,
          existingFolders: referenceFolders
        })
        
        setSuggestedGroups(groups)
        setStatus('suggested')
      } catch (error) {
        logger.error('Failed to suggest groups', error)
        setStatus('error')
      }
      return
    }
    
    // TMarks 模式：直接开始整理
    startOrganizing()
  }

  // 确认分组后开始整理
  const handleConfirmGroups = (groups: string[]) => {
    startOrganizing(groups)
  }

  // 开始整理
  const startOrganizing = async (groups?: string[]) => {
    setStatus('processing')
    setBookmarks([])
    setRealtimeBookmarks([])
    setErrors([])

    try {
      const finalFolders = groups || existingFolders
      
      const result = await bookmarkOrganizer.organizeUrls(
        urls,
        {
          provider,
          apiKey,
          model,
          apiUrl,
          concurrency: config.concurrency,
          existingTags,
          existingFolders: finalFolders,
          mode,
          tagStyle: config.useCustomStyle ? config.customStyle : undefined,
          temperature: config.temperature,
          batchDelay: config.batchDelay,
          titleLength: config.titleLength,
          descriptionDetail: config.descriptionDetail,
          tagCountMin: config.tagCountMin,
          tagCountMax: config.tagCountMax,
          language: config.language,
          batchMode: config.batchMode,
          batchSize: config.batchSize
        },
        (prog) => {
          setProgress(prog)
          if (prog.latestBookmark) {
            setRealtimeBookmarks(prev => [...prev, prog.latestBookmark!])
          }
        }
      )

      setBookmarks(result.bookmarks)
      setErrors(result.errors)
      setStatus('completed')
    } catch (error) {
      logger.error('AI organize failed', error)
      setStatus('error')
    }
  }

  // 暂停/恢复
  const handlePauseResume = () => {
    if (state.isPaused) {
      bookmarkOrganizer.resume()
      setIsPaused(false)
    } else {
      bookmarkOrganizer.pause()
      setIsPaused(true)
    }
  }

  // 停止处理
  const handleStop = () => {
    bookmarkOrganizer.abort()
    setStatus('completed')
  }

  // 重试失败的
  const handleRetryFailed = async () => {
    if (state.errors.length === 0) return

    const failedUrls = state.errors.map(e => e.url)
    setStatus('processing')

    try {
      const result = await bookmarkOrganizer.organizeUrls(
        failedUrls,
        {
          provider,
          apiKey,
          model,
          apiUrl,
          concurrency: config.concurrency,
          existingTags,
          existingFolders,
          mode,
          tagStyle: config.useCustomStyle ? config.customStyle : undefined,
          temperature: config.temperature,
          batchDelay: config.batchDelay,
          titleLength: config.titleLength,
          descriptionDetail: config.descriptionDetail,
          tagCountMin: config.tagCountMin,
          tagCountMax: config.tagCountMax,
          language: config.language
        },
        (prog) => {
          setProgress({
            ...prog,
            current: state.progress.current - state.errors.length + prog.current,
            total: urls.length
          })
        }
      )

      const newBookmarks = [...state.bookmarks]
      result.bookmarks.forEach(newBookmark => {
        const index = newBookmarks.findIndex(b => b.url === newBookmark.url)
        if (index !== -1) {
          newBookmarks[index] = newBookmark
        }
      })

      setBookmarks(newBookmarks)
      setErrors(result.errors)
      setStatus('completed')
    } catch (error) {
      logger.error('Retry failed bookmarks', error)
      setStatus('error')
    }
  }

  return {
    handleStart,
    handleConfirmGroups,
    handlePauseResume,
    handleStop,
    handleRetryFailed
  }
}
