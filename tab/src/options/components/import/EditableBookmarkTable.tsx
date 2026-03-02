/**
 * 可编辑的书签表格组件
 * 支持：添加/删除标签、编辑标题、分页、搜索、批量操作
 */

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BookmarkTableHeader } from './BookmarkTableHeader'
import { BookmarkTableRow } from './BookmarkTableRow'

export interface EditableBookmark {
  url: string
  title: string
  description?: string
  note?: string // 用户备注
  tags: Array<{
    name: string
    isNew: boolean
    confidence: number
  }>
  folder?: string // NewTab 模式使用
  isSelected?: boolean
  isSkipped?: boolean
}

interface EditableBookmarkTableProps {
  bookmarks: EditableBookmark[]
  existingTags?: string[]
  mode?: 'tmarks' | 'newtab' // 显示模式
  onBookmarksChange: (bookmarks: EditableBookmark[]) => void
}

export function EditableBookmarkTable({
  bookmarks,
  existingTags = [],
  mode = 'tmarks',
  onBookmarksChange
}: EditableBookmarkTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  // 搜索过滤
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery) return bookmarks
    const query = searchQuery.toLowerCase()
    return bookmarks.filter(b => 
      b.url.toLowerCase().includes(query) ||
      b.title.toLowerCase().includes(query) ||
      b.tags.some(t => t.name.toLowerCase().includes(query))
    )
  }, [bookmarks, searchQuery])

  // 分页
  const totalPages = Math.ceil(filteredBookmarks.length / pageSize)
  const paginatedBookmarks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredBookmarks.slice(start, start + pageSize)
  }, [filteredBookmarks, currentPage, pageSize])

  // 统计
  const stats = useMemo(() => {
    const newTagsSet = new Set<string>()
    bookmarks.forEach(b => {
      b.tags.forEach(t => {
        if (t.isNew) newTagsSet.add(t.name)
      })
    })
    return {
      total: bookmarks.length,
      filtered: filteredBookmarks.length,
      newTags: newTagsSet.size,
      selected: bookmarks.filter(b => b.isSelected).length
    }
  }, [bookmarks, filteredBookmarks])

  // 更新书签
  const updateBookmark = (index: number, updates: Partial<EditableBookmark>) => {
    const newBookmarks = [...bookmarks]
    newBookmarks[index] = { ...newBookmarks[index], ...updates }
    onBookmarksChange(newBookmarks)
  }

  // 全选/反选
  const handleToggleAll = () => {
    const allSelected = paginatedBookmarks.every(b => b.isSelected)
    const newBookmarks = bookmarks.map(b => {
      if (paginatedBookmarks.includes(b)) {
        return { ...b, isSelected: !allSelected }
      }
      return b
    })
    onBookmarksChange(newBookmarks)
  }

  // 批量添加标签
  const handleBatchAddTag = () => {
    const tagName = prompt('为选中的书签添加标签：')
    if (!tagName || !tagName.trim()) return

    const isNew = !existingTags.includes(tagName.trim())
    const newBookmarks = bookmarks.map(b => {
      if (b.isSelected && !b.tags.some(t => t.name === tagName.trim())) {
        return {
          ...b,
          tags: [...b.tags, { name: tagName.trim(), isNew, confidence: 1.0 }]
        }
      }
      return b
    })
    onBookmarksChange(newBookmarks)
  }

  // 批量修改文件夹
  const handleBatchChangeFolder = () => {
    const newFolder = prompt('为选中的书签设置文件夹：')
    if (!newFolder || !newFolder.trim()) return

    const newBookmarks = bookmarks.map(b => {
      if (b.isSelected) {
        return { ...b, folder: newFolder.trim() }
      }
      return b
    })
    onBookmarksChange(newBookmarks)
  }

  return (
    <div className="space-y-4">
      <BookmarkTableHeader
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query)
          setCurrentPage(1)
        }}
        mode={mode}
        onBatchAddTag={handleBatchAddTag}
        onBatchChangeFolder={handleBatchChangeFolder}
      />

      {/* 表格 */}
      <div className="border border-[var(--tab-options-button-border)] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--tab-options-card-bg)] border-b border-[var(--tab-options-button-border)]">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={paginatedBookmarks.length > 0 && paginatedBookmarks.every(b => b.isSelected)}
                  onChange={handleToggleAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--tab-options-text)]">URL</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--tab-options-text)]">标题</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--tab-options-text)]">
                {mode === 'newtab' ? '文件夹' : '标签'}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--tab-options-text)]">备注</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedBookmarks.map((bookmark) => {
              const actualIndex = bookmarks.indexOf(bookmark)
              return (
                <BookmarkTableRow
                  key={actualIndex}
                  bookmark={bookmark}
                  mode={mode}
                  existingTags={existingTags}
                  onUpdate={(updates) => updateBookmark(actualIndex, updates)}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--tab-options-text)]">
            显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredBookmarks.length)} / {filteredBookmarks.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-[var(--tab-options-button-border)] rounded-md hover:bg-[var(--tab-options-button-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[var(--tab-options-text)]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-[var(--tab-options-button-border)] rounded-md hover:bg-[var(--tab-options-button-hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
