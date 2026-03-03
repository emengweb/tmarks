/**
 * AI 批量整理步骤组件 - 重构版
 */

import { XCircle } from 'lucide-react'
import type { EditableBookmark } from './EditableBookmarkTable'
import type { AIProvider } from '@/types'
import { AIOrganizeConfig } from './AIOrganizeConfig'
import { AIOrganizeProgress } from './AIOrganizeProgress'
import { AIOrganizeRealtimeList } from './AIOrganizeRealtimeList'
import { AIOrganizeComplete } from './AIOrganizeComplete'
import { GroupSuggestionStep } from './GroupSuggestionStep'
import {
  useAIOrganizeState,
  useProgressPersistence,
  useAIOrganizeHandlers,
  useKeyboardShortcuts
} from './ai-organize'

interface AIOrganizeStepProps {
  urls: string[]
  provider: AIProvider
  apiKey: string
  model?: string
  apiUrl?: string
  existingTags?: string[]
  existingFolders?: string[]
  mode?: 'tmarks' | 'newtab'
  onComplete: (bookmarks: EditableBookmark[]) => void
  onBack: () => void
}

export function AIOrganizeStep({
  urls,
  provider,
  apiKey,
  model,
  apiUrl,
  existingTags = [],
  existingFolders = [],
  mode = 'tmarks',
  onComplete,
  onBack
}: AIOrganizeStepProps) {
  const { state, config, setters } = useAIOrganizeState(urls.length)

  // 进度持久化
  const { 
    clearProgress, 
    showRestorePrompt, 
    savedData, 
    handleRestore, 
    handleIgnore 
  } = useProgressPersistence(
    urls,
    state,
    config,
    (data) => {
      setters.setRealtimeBookmarks(data.bookmarks)
      setters.setProgress(data.progress)
      setters.setErrors(data.errors)
      setters.setStatus('completed')
      setters.setBookmarks(data.bookmarks)
      
      if (data.options) {
        setters.setConcurrency(data.options.concurrency || 2)
        setters.setBatchMode(data.options.batchMode || 'single')
        setters.setBatchSize(data.options.batchSize || 20)
        setters.setUseCustomStyle(data.options.useCustomStyle || false)
        setters.setCustomStyle(data.options.customStyle || '')
        setters.setTitleLength(data.options.titleLength || 'medium')
        setters.setDescriptionDetail(data.options.descriptionDetail || 'short')
        setters.setTagCountMin(data.options.tagCountMin || 2)
        setters.setTagCountMax(data.options.tagCountMax || 5)
        setters.setLanguage(data.options.language || 'zh')
        setters.setTemperature(data.options.temperature || 0.7)
        setters.setBatchDelay(data.options.batchDelay || 1000)
      }
    }
  )

  // 事件处理器
  const handlers = useAIOrganizeHandlers({
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
    ...setters
  })

  // 键盘快捷键
  useKeyboardShortcuts({
    status: state.status,
    isPaused: state.isPaused,
    onPauseResume: handlers.handlePauseResume,
    onStop: handlers.handleStop
  })

  // 继续处理
  const handleContinue = () => {
    clearProgress()
    onComplete(state.bookmarks)
  }

  return (
    <div className="space-y-6" role="region" aria-label="AI 批量整理">
      {/* 恢复进度提示 */}
      {showRestorePrompt && savedData && (
        <div className="p-4 bg-[var(--tab-message-info-bg)] rounded-lg border border-[var(--tab-message-info-border)] flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm text-[var(--tab-options-text)] font-medium mb-1">
              发现未完成的 AI 整理任务
            </p>
            <p className="text-xs text-[var(--tab-options-text-muted)]">
              已完成 {savedData.bookmarks.length}/{savedData.urls.length} 个书签，是否继续？
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRestore}
              className="px-3 py-1.5 text-xs bg-[var(--tab-options-button-primary-bg)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              继续
            </button>
            <button
              onClick={handleIgnore}
              className="px-3 py-1.5 text-xs bg-[var(--tab-options-card-bg)] text-[var(--tab-options-text)] border border-[var(--tab-options-button-border)] rounded-lg hover:bg-[var(--tab-options-button-border)] transition-colors"
            >
              忽略
            </button>
          </div>
        </div>
      )}

      {/* 配置区 */}
      {state.status === 'idle' && (
        <AIOrganizeConfig
          mode={mode}
          batchMode={config.batchMode}
          setBatchMode={setters.setBatchMode}
          batchSize={config.batchSize}
          setBatchSize={setters.setBatchSize}
          concurrency={config.concurrency}
          setConcurrency={setters.setConcurrency}
          titleLength={config.titleLength}
          setTitleLength={setters.setTitleLength}
          descriptionDetail={config.descriptionDetail}
          setDescriptionDetail={setters.setDescriptionDetail}
          tagCountMin={config.tagCountMin}
          setTagCountMin={setters.setTagCountMin}
          tagCountMax={config.tagCountMax}
          setTagCountMax={setters.setTagCountMax}
          language={config.language}
          setLanguage={setters.setLanguage}
          temperature={config.temperature}
          setTemperature={setters.setTemperature}
          useCustomStyle={config.useCustomStyle}
          setUseCustomStyle={setters.setUseCustomStyle}
          customStyle={config.customStyle}
          setCustomStyle={setters.setCustomStyle}
          existingFolders={existingFolders}
          predefinedFolders={config.predefinedFolders}
          setPredefinedFolders={setters.setPredefinedFolders}
          onStart={handlers.handleStart}
        />
      )}

      {/* 分组推荐中 */}
      {state.status === 'suggesting' && (
        <div className="p-6 bg-[var(--tab-message-info-bg)] rounded-xl border border-[var(--tab-message-info-border)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--tab-message-info-icon)] flex items-center justify-center animate-pulse">
              <div className="w-4 h-4 border-2 border-[var(--tab-message-info-icon-text)] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-[var(--tab-options-text)]">
              AI 正在分析 {urls.length} 个网址，推荐合适的分组...
            </p>
          </div>
        </div>
      )}

      {/* 分组推荐结果 */}
      {state.status === 'suggested' && (
        <GroupSuggestionStep
          suggestedGroups={state.suggestedGroups}
          onConfirm={handlers.handleConfirmGroups}
          onBack={() => setters.setStatus('idle')}
        />
      )}

      {/* 处理中 */}
      {state.status === 'processing' && (
        <div className="space-y-4">
          <AIOrganizeProgress
            progress={state.progress}
            isPaused={state.isPaused}
            onPauseResume={handlers.handlePauseResume}
            onStop={handlers.handleStop}
          />
          <AIOrganizeRealtimeList
            bookmarks={state.realtimeBookmarks}
            mode={mode}
          />
        </div>
      )}

      {/* 完成 */}
      {state.status === 'completed' && (
        <AIOrganizeComplete
          progress={state.progress}
          errors={state.errors}
          onRetryFailed={handlers.handleRetryFailed}
          onContinue={handleContinue}
        />
      )}

      {/* 错误 */}
      {state.status === 'error' && (
        <div className="p-6 bg-[var(--tab-message-danger-bg)] rounded-xl border border-[var(--tab-message-danger-border)]">
          <div className="flex items-start gap-4">
            <XCircle className="w-8 h-8 text-[var(--tab-message-danger-icon)] flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">处理失败</h3>
              <p className="text-sm text-[var(--tab-message-danger-icon)] mt-1">请检查 AI 配置后重试</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={onBack}
                  className="px-4 py-2 border border-[var(--tab-options-button-border)] text-[var(--tab-options-button-text)] rounded-lg hover:bg-[var(--tab-options-button-hover-bg)]"
                  aria-label="返回上一步"
                >
                  返回
                </button>
                <button
                  onClick={handlers.handleStart}
                  className="px-4 py-2 bg-[var(--tab-message-danger-icon)] text-[var(--tab-message-danger-icon-text)] rounded-lg hover:bg-[var(--tab-options-danger-hover-bg)]"
                  aria-label="重新开始 AI 整理"
                >
                  重新开始
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
