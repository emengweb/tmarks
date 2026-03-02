/**
 * 书签表格头部组件
 * 包含统计信息、搜索框和批量操作按钮
 */

import { Search } from 'lucide-react'

interface BookmarkTableHeaderProps {
  stats: {
    total: number
    filtered: number
    newTags: number
    selected: number
  }
  searchQuery: string
  onSearchChange: (query: string) => void
  mode: 'tmarks' | 'newtab'
  onBatchAddTag?: () => void
  onBatchChangeFolder?: () => void
}

export function BookmarkTableHeader({
  stats,
  searchQuery,
  onSearchChange,
  mode,
  onBatchAddTag,
  onBatchChangeFolder
}: BookmarkTableHeaderProps) {
  return (
    <>
      {/* 统计信息 */}
      <div className="flex items-center justify-between p-4 bg-[var(--tab-options-button-hover-bg)] rounded-lg border border-[var(--tab-options-button-border)]">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-[var(--tab-options-text)]">总计：</span>
            <span className="font-medium text-[var(--tab-options-title)]">{stats.total}</span>
          </div>
          {searchQuery && (
            <div>
              <span className="text-[var(--tab-options-text)]">筛选：</span>
              <span className="font-medium text-[var(--tab-options-title)]">{stats.filtered}</span>
            </div>
          )}
          <div>
            <span className="text-[var(--tab-options-text)]">新标签：</span>
            <span className="font-medium text-[var(--tab-message-info-icon)]">{stats.newTags}</span>
          </div>
          {stats.selected > 0 && (
            <div>
              <span className="text-[var(--tab-options-text)]">已选：</span>
              <span className="font-medium text-[var(--tab-message-success-icon)]">{stats.selected}</span>
            </div>
          )}
        </div>
      </div>

      {/* 搜索和批量操作 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--tab-options-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索 URL、标题或标签..."
            aria-label="搜索 URL、标题或标签"
            className="w-full pl-10 pr-4 py-2 border border-[var(--tab-options-button-border)] rounded-md bg-[var(--tab-options-card-bg)] text-[var(--tab-options-text)]"
          />
        </div>
        {stats.selected > 0 && (
          <>
            {mode === 'tmarks' && onBatchAddTag && (
              <button
                onClick={onBatchAddTag}
                className="px-4 py-2 text-sm font-medium text-[var(--tab-options-button-primary-text)] bg-[var(--tab-options-button-primary-bg)] rounded-md hover:bg-[var(--tab-options-button-primary-hover)]"
              >
                批量添加标签
              </button>
            )}
            {mode === 'newtab' && onBatchChangeFolder && (
              <button
                onClick={onBatchChangeFolder}
                className="px-4 py-2 text-sm font-medium text-[var(--tab-popup-section-purple-badge-text)] bg-[var(--tab-popup-section-purple-badge-bg)] rounded-md hover:opacity-90"
              >
                批量修改文件夹
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}
