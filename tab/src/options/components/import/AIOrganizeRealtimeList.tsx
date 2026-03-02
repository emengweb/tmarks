/**
 * AI 整理实时书签列表组件
 * 显示已完成的书签（最新 10 条）
 */

import { CheckCircle } from 'lucide-react'
import type { EditableBookmark } from './EditableBookmarkTable'

interface AIOrganizeRealtimeListProps {
  bookmarks: EditableBookmark[]
  mode: 'tmarks' | 'newtab'
}

export function AIOrganizeRealtimeList({
  bookmarks,
  mode
}: AIOrganizeRealtimeListProps) {
  if (bookmarks.length === 0) return null

  return (
    <div className="p-4 bg-[var(--tab-options-card-bg)] rounded-xl border border-[var(--tab-options-card-border)]" role="region" aria-label="已完成的书签列表">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[var(--tab-options-title)]">
          已完成的书签 ({bookmarks.length})
        </h4>
        <span className="text-xs text-[var(--tab-options-text-muted)]">最新的 10 条</span>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto" role="list">
        {bookmarks.slice(-10).reverse().map((bookmark, index) => (
          <div
            key={index}
            className="p-3 bg-[var(--tab-options-button-hover-bg)] rounded-lg border border-[var(--tab-options-button-border)] hover:border-[var(--tab-message-info-border)] transition-colors"
            role="listitem"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[var(--tab-message-success-icon)] flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--tab-options-title)] truncate" title={bookmark.title}>
                  {bookmark.title}
                </div>
                <div className="text-xs text-[var(--tab-options-text-muted)] truncate mt-0.5" title={bookmark.url}>
                  {bookmark.url}
                </div>
                {bookmark.description && (
                  <div className="text-xs text-[var(--tab-options-text)] mt-1 line-clamp-2" title={bookmark.description}>
                    {bookmark.description}
                  </div>
                )}
                {mode === 'tmarks' && bookmark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2" role="list" aria-label="标签列表">
                    {bookmark.tags.map((tag, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                          tag.isNew ? 'bg-[var(--tab-options-tag-bg)] text-[var(--tab-message-info-icon)]' : 'bg-[var(--tab-options-button-hover-bg)] text-[var(--tab-options-text)]'
                        }`}
                        role="listitem"
                        title={tag.isNew ? '新标签' : '已有标签'}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                {mode === 'newtab' && bookmark.folder && (
                  <div className="mt-2">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 text-xs bg-[var(--tab-popup-section-purple-badge-bg)] text-[var(--tab-popup-section-purple-badge-text)] rounded-full"
                      title={`文件夹: ${bookmark.folder}`}
                    >
                      {bookmark.folder}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
