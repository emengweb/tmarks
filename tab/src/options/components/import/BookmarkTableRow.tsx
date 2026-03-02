/**
 * 书签表格行组件
 * 显示单个书签的信息，支持编辑标题、标签和文件夹
 */

import { useState } from 'react'
import { X, Plus, Edit2, Check } from 'lucide-react'
import type { EditableBookmark } from './EditableBookmarkTable'

interface BookmarkTableRowProps {
  bookmark: EditableBookmark
  mode: 'tmarks' | 'newtab'
  existingTags: string[]
  onUpdate: (updates: Partial<EditableBookmark>) => void
}

export function BookmarkTableRow({
  bookmark,
  mode,
  existingTags,
  onUpdate
}: BookmarkTableRowProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editingTitle, setEditingTitle] = useState(bookmark.title)
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [editingNote, setEditingNote] = useState(bookmark.note || '')

  // 添加标签
  const handleAddTag = () => {
    const tagName = window.prompt('输入标签名称：')
    if (!tagName || !tagName.trim()) return

    if (bookmark.tags.some(t => t.name === tagName.trim())) {
      window.alert('标签已存在')
      return
    }

    const isNew = !existingTags.includes(tagName.trim())
    onUpdate({
      tags: [...bookmark.tags, { name: tagName.trim(), isNew, confidence: 1.0 }]
    })
  }

  // 删除标签
  const handleRemoveTag = (tagIndex: number) => {
    const newTags = bookmark.tags.filter((_, i) => i !== tagIndex)
    onUpdate({ tags: newTags })
  }

  // 修改文件夹
  const handleChangeFolder = () => {
    const currentFolder = bookmark.folder || '未分类'
    const newFolder = window.prompt('输入文件夹名称：', currentFolder)
    if (newFolder && newFolder.trim()) {
      onUpdate({ folder: newFolder.trim() })
    }
  }

  // 保存标题
  const handleSaveTitle = () => {
    if (editingTitle.trim()) {
      onUpdate({ title: editingTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  // 保存备注
  const handleSaveNote = () => {
    onUpdate({ note: editingNote.trim() })
    setIsEditingNote(false)
  }

  return (
    <tr className="hover:bg-[var(--tab-options-button-hover-bg)]">
      {/* 选择框 */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={bookmark.isSelected || false}
          onChange={() => onUpdate({ isSelected: !bookmark.isSelected })}
          className="w-4 h-4"
          aria-label={`选择书签 ${bookmark.title}`}
        />
      </td>

      {/* URL */}
      <td className="px-4 py-3">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--tab-message-info-icon)] hover:underline max-w-xs truncate block"
          title={bookmark.url}
        >
          {bookmark.url}
        </a>
      </td>

      {/* 标题 */}
      <td className="px-4 py-3">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle()
                if (e.key === 'Escape') setIsEditingTitle(false)
              }}
              aria-label="编辑标题"
              className="flex-1 px-2 py-1 text-sm border border-[var(--tab-options-button-border)] rounded"
              autoFocus
            />
            <button
              onClick={handleSaveTitle}
              className="p-1 text-[var(--tab-message-success-icon)] hover:bg-[var(--tab-message-success-bg)] rounded"
              aria-label="保存标题"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="text-sm text-[var(--tab-options-text)]">{bookmark.title}</span>
            <button
              onClick={() => {
                setIsEditingTitle(true)
                setEditingTitle(bookmark.title)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--tab-options-text-muted)] hover:text-[var(--tab-options-text)]"
              aria-label="编辑标题"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>

      {/* 标签或文件夹 */}
      <td className="px-4 py-3">
        {mode === 'newtab' ? (
          // NewTab 模式：显示和编辑文件夹
          <div className="flex items-center gap-2 group">
            <span className="inline-flex items-center px-3 py-1 text-sm bg-[var(--tab-popup-section-purple-badge-bg)] text-[var(--tab-popup-section-purple-badge-text)] rounded-full border border-[var(--tab-popup-section-purple-border)]">
              {bookmark.folder || '未分类'}
            </span>
            <button
              onClick={handleChangeFolder}
              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--tab-popup-section-purple-badge-text)] hover:bg-[var(--tab-popup-section-purple-badge-bg)] rounded"
              title="修改文件夹"
              aria-label={`修改文件夹 ${bookmark.folder || '未分类'}`}
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          // TMarks 模式：显示标签
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                  tag.isNew 
                    ? 'bg-[var(--tab-options-tag-bg)] text-[var(--tab-message-info-icon)] border border-[var(--tab-options-tag-border)]' 
                    : 'bg-[var(--tab-options-button-hover-bg)] text-[var(--tab-options-text)]'
                }`}
              >
                {tag.name}
                <button
                  onClick={() => handleRemoveTag(tagIndex)}
                  className="hover:text-[var(--tab-message-danger-icon)]"
                  aria-label={`删除标签 ${tag.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={handleAddTag}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[var(--tab-options-text)] border border-dashed border-[var(--tab-options-button-border)] rounded-full hover:border-[var(--tab-message-info-border)] hover:text-[var(--tab-message-info-icon)]"
              aria-label="添加标签"
            >
              <Plus className="w-3 h-3" />
              添加
            </button>
          </div>
        )}
      </td>

      {/* 备注 */}
      <td className="px-4 py-3">
        {isEditingNote ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editingNote}
              onChange={(e) => setEditingNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveNote()
                if (e.key === 'Escape') setIsEditingNote(false)
              }}
              placeholder="添加备注..."
              aria-label="编辑备注"
              className="flex-1 px-2 py-1 text-sm border border-[var(--tab-options-button-border)] rounded"
              autoFocus
            />
            <button
              onClick={handleSaveNote}
              className="p-1 text-[var(--tab-message-success-icon)] hover:bg-[var(--tab-message-success-bg)] rounded"
              aria-label="保存备注"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <span className="text-sm text-[var(--tab-options-text-muted)]">
              {bookmark.note || '添加备注...'}
            </span>
            <button
              onClick={() => {
                setIsEditingNote(true)
                setEditingNote(bookmark.note || '')
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--tab-options-text-muted)] hover:text-[var(--tab-options-text)]"
              aria-label="编辑备注"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
