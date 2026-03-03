/**
 * AI 整理状态管理 Hook
 */

import { useState, useEffect } from 'react'
import type { EditableBookmark } from '../EditableBookmarkTable'
import type { OrganizeProgress, SuggestedGroup } from '@/lib/services/bookmark-organizer'
import { getUILanguage } from '@/lib/i18n'

export type ProcessStatus = 'idle' | 'suggesting' | 'suggested' | 'processing' | 'paused' | 'completed' | 'error'

export interface AIOrganizeState {
  status: ProcessStatus
  progress: OrganizeProgress
  bookmarks: EditableBookmark[]
  realtimeBookmarks: EditableBookmark[]
  errors: Array<{ url: string; error: string }>
  suggestedGroups: SuggestedGroup[]
  isPaused: boolean
}

export interface AIOrganizeConfig {
  concurrency: number
  batchMode: 'single' | 'batch'
  batchSize: number
  useCustomStyle: boolean
  customStyle: string
  predefinedFolders: string[]
  titleLength: 'short' | 'medium' | 'long'
  descriptionDetail: 'minimal' | 'short' | 'detailed'
  tagCountMin: number
  tagCountMax: number
  language: 'zh' | 'en' | 'mixed'
  temperature: number
  batchDelay: number
}

export function useAIOrganizeState(urlsLength: number) {
  const [status, setStatus] = useState<ProcessStatus>('idle')
  const [progress, setProgress] = useState<OrganizeProgress>({
    current: 0,
    total: urlsLength,
    status: '准备开始...',
    successCount: 0,
    failedCount: 0
  })
  const [bookmarks, setBookmarks] = useState<EditableBookmark[]>([])
  const [realtimeBookmarks, setRealtimeBookmarks] = useState<EditableBookmark[]>([])
  const [errors, setErrors] = useState<Array<{ url: string; error: string }>>([])
  const [suggestedGroups, setSuggestedGroups] = useState<SuggestedGroup[]>([])
  const [isPaused, setIsPaused] = useState(false)

  // 配置状态
  const [concurrency, setConcurrency] = useState(2)
  const [batchMode, setBatchMode] = useState<'single' | 'batch'>('single')
  const [batchSize, setBatchSize] = useState(20)
  const [useCustomStyle, setUseCustomStyle] = useState(false)
  const [customStyle, setCustomStyle] = useState('')
  const [predefinedFolders, setPredefinedFolders] = useState<string[]>([])
  const [titleLength, setTitleLength] = useState<'short' | 'medium' | 'long'>('medium')
  const [descriptionDetail, setDescriptionDetail] = useState<'minimal' | 'short' | 'detailed'>('short')
  const [tagCountMin, setTagCountMin] = useState(2)
  const [tagCountMax, setTagCountMax] = useState(5)
  const [language, setLanguage] = useState<'zh' | 'en' | 'mixed'>('zh')
  const [temperature, setTemperature] = useState(0.7)
  const [batchDelay, setBatchDelay] = useState(1000)

  // 自动检测浏览器语言
  useEffect(() => {
    const browserLang = getUILanguage()
    if (browserLang.startsWith('zh')) {
      setLanguage('zh')
    } else if (browserLang.startsWith('en')) {
      setLanguage('en')
    } else {
      setLanguage('mixed')
    }
  }, [])

  const state: AIOrganizeState = {
    status,
    progress,
    bookmarks,
    realtimeBookmarks,
    errors,
    suggestedGroups,
    isPaused
  }

  const config: AIOrganizeConfig = {
    concurrency,
    batchMode,
    batchSize,
    useCustomStyle,
    customStyle,
    predefinedFolders,
    titleLength,
    descriptionDetail,
    tagCountMin,
    tagCountMax,
    language,
    temperature,
    batchDelay
  }

  const setters = {
    setStatus,
    setProgress,
    setBookmarks,
    setRealtimeBookmarks,
    setErrors,
    setSuggestedGroups,
    setIsPaused,
    setConcurrency,
    setBatchMode,
    setBatchSize,
    setUseCustomStyle,
    setCustomStyle,
    setPredefinedFolders,
    setTitleLength,
    setDescriptionDetail,
    setTagCountMin,
    setTagCountMax,
    setLanguage,
    setTemperature,
    setBatchDelay
  }

  return { state, config, setters }
}
