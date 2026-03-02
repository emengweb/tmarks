/**
 * AI 整理进度显示组件
 * 显示处理中的状态、进度条、统计和控制按钮
 */

import { Loader2, Pause, Play, StopCircle } from 'lucide-react'
import type { OrganizeProgress } from '@/lib/services/bookmark-organizer'

interface AIOrganizeProgressProps {
  progress: OrganizeProgress
  isPaused: boolean
  onPauseResume: () => void
  onStop: () => void
}

export function AIOrganizeProgress({
  progress,
  isPaused,
  onPauseResume,
  onStop
}: AIOrganizeProgressProps) {
  const progressPercentage = (progress.current / progress.total) * 100

  return (
    <div className="p-6 bg-[var(--tab-options-card-bg)] rounded-xl border border-[var(--tab-options-card-border)]" role="region" aria-label="AI 整理进度">
      <div className="flex items-center gap-4 mb-4">
        {isPaused ? (
          <Pause className="w-8 h-8 text-[var(--tab-message-warning-icon)]" aria-hidden="true" />
        ) : (
          <Loader2 className="w-8 h-8 text-[var(--tab-message-info-icon)] animate-spin" aria-hidden="true" />
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">
            {isPaused ? '已暂停' : '正在处理...'}
          </h3>
          <p className="text-sm text-[var(--tab-options-text)]" aria-live="polite">{progress.status}</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--tab-options-text)]">进度</span>
          <span className="font-medium text-[var(--tab-options-title)]" aria-live="polite">
            {progress.current} / {progress.total}
          </span>
        </div>
        <div 
          className="w-full bg-[var(--tab-options-progress-bar-bg)] rounded-full h-3 overflow-hidden"
          role="progressbar"
          aria-valuenow={progress.current}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-label={`处理进度 ${progressPercentage.toFixed(0)}%`}
        >
          <div
            className="h-full bg-[var(--tab-options-progress-bar-fill)] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-4 mt-4" role="group" aria-label="处理统计">
        <div className="text-center p-3 bg-[var(--tab-options-button-hover-bg)] rounded-lg">
          <div className="text-2xl font-bold text-[var(--tab-options-title)]" aria-label={`已处理 ${progress.current} 个`}>
            {progress.current}
          </div>
          <div className="text-xs text-[var(--tab-options-text)]">已处理</div>
        </div>
        <div className="text-center p-3 bg-[var(--tab-message-success-bg)] rounded-lg">
          <div className="text-2xl font-bold text-[var(--tab-message-success-icon)]" aria-label={`成功 ${progress.successCount} 个`}>
            {progress.successCount}
          </div>
          <div className="text-xs text-[var(--tab-options-text)]">成功</div>
        </div>
        <div className="text-center p-3 bg-[var(--tab-message-danger-bg)] rounded-lg">
          <div className="text-2xl font-bold text-[var(--tab-message-danger-icon)]" aria-label={`失败 ${progress.failedCount} 个`}>
            {progress.failedCount}
          </div>
          <div className="text-xs text-[var(--tab-options-text)]">失败</div>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={onPauseResume}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-[var(--tab-options-button-border)] text-[var(--tab-options-button-text)] rounded-lg hover:bg-[var(--tab-options-button-hover-bg)]"
          aria-label={isPaused ? '继续处理' : '暂停处理'}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4" aria-hidden="true" />
              继续
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" aria-hidden="true" />
              暂停
            </>
          )}
        </button>
        <button
          onClick={onStop}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--tab-message-danger-icon)] text-[var(--tab-message-danger-icon-text)] rounded-lg hover:opacity-90"
          aria-label="停止处理"
        >
          <StopCircle className="w-4 h-4" aria-hidden="true" />
          停止
        </button>
      </div>
    </div>
  )
}
