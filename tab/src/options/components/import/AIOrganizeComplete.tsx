/**
 * AI 整理完成状态组件
 * 显示完成信息、错误列表和操作按钮
 */

import { CheckCircle, AlertCircle } from 'lucide-react'
import type { OrganizeProgress } from '@/lib/services/bookmark-organizer'

interface AIOrganizeCompleteProps {
  progress: OrganizeProgress
  errors: Array<{ url: string; error: string }>
  onRetryFailed: () => void
  onContinue: () => void
}

export function AIOrganizeComplete({
  progress,
  errors,
  onRetryFailed,
  onContinue
}: AIOrganizeCompleteProps) {
  return (
    <div className="space-y-4" role="region" aria-label="AI 整理完成">
      <div className="p-6 bg-[var(--tab-message-success-bg)] rounded-xl border border-[var(--tab-message-success-border)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--tab-message-success-icon)] flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-[var(--tab-message-success-icon-text)]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">处理完成</h3>
            <p className="text-sm text-[var(--tab-options-text)] mt-1" aria-live="polite">
              成功处理 {progress.successCount} 个，失败 {progress.failedCount} 个
            </p>
          </div>
        </div>
      </div>

      {/* 错误列表 */}
      {errors.length > 0 && (
        <div className="p-4 bg-[var(--tab-message-danger-bg)] rounded-lg border border-[var(--tab-message-danger-border)]" role="alert" aria-label="失败的 URL 列表">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-[var(--tab-message-danger-icon)]" aria-hidden="true" />
            <span className="text-sm font-medium text-[var(--tab-options-title)]">
              失败的 URL ({errors.length})
            </span>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto" role="list">
            {errors.slice(0, 10).map((error, i) => (
              <div key={i} className="text-xs text-[var(--tab-message-danger-icon)]" role="listitem">
                {error.url}: {error.error}
              </div>
            ))}
            {errors.length > 10 && (
              <div className="text-xs text-[var(--tab-message-danger-icon)]">
                还有 {errors.length - 10} 个错误...
              </div>
            )}
          </div>
          <button
            onClick={onRetryFailed}
            className="mt-3 px-4 py-2 text-sm bg-[var(--tab-message-danger-icon)] text-[var(--tab-message-danger-icon-text)] rounded-lg hover:opacity-90"
            aria-label={`重试 ${errors.length} 个失败的 URL`}
          >
            重试失败的 URL
          </button>
        </div>
      )}

      {/* 继续按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg hover:bg-[var(--tab-options-button-primary-hover)]"
          aria-label="继续编辑书签"
        >
          继续编辑
        </button>
      </div>
    </div>
  )
}
