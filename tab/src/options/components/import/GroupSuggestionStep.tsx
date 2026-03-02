/**
 * 分组推荐步骤组件
 * AI 推荐分组，用户确认/编辑
 */

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Sparkles } from 'lucide-react'
import type { SuggestedGroup } from '@/lib/services/bookmark-organizer'

interface GroupSuggestionStepProps {
  suggestedGroups: SuggestedGroup[]
  onConfirm: (groups: string[]) => void
  onBack: () => void
}

export function GroupSuggestionStep({
  suggestedGroups,
  onConfirm,
  onBack
}: GroupSuggestionStepProps) {
  const [groups, setGroups] = useState<SuggestedGroup[]>(suggestedGroups)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const handleEdit = (index: number) => {
    setEditingIndex(index)
    setEditName(groups[index].name)
    setEditDescription(groups[index].description)
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editName.trim()) {
      const updated = [...groups]
      updated[editingIndex] = {
        ...updated[editingIndex],
        name: editName.trim(),
        description: editDescription.trim()
      }
      setGroups(updated)
      setEditingIndex(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditName('')
    setEditDescription('')
  }

  const handleDelete = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index))
  }

  const handleAdd = () => {
    if (newGroupName.trim() && groups.length < 20) {
      setGroups([...groups, {
        name: newGroupName.trim(),
        description: '',
        count: 0
      }])
      setNewGroupName('')
    }
  }

  const handleConfirm = () => {
    const groupNames = groups.map(g => g.name).filter(n => n.length > 0)
    if (groupNames.length > 0) {
      onConfirm(groupNames)
    }
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="p-6 bg-[var(--tab-message-info-bg)] rounded-xl border border-[var(--tab-message-info-border)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--tab-message-info-icon)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[var(--tab-message-info-icon-text)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">AI 推荐分组</h3>
            <p className="text-sm text-[var(--tab-options-text)] mt-1">
              根据你的网址，AI 推荐了以下分组。你可以编辑、删除或添加新分组。
            </p>
          </div>
        </div>
      </div>

      {/* 分组列表 */}
      <div className="space-y-3">
        {groups.map((group, index) => (
          <div
            key={index}
            className="p-4 bg-[var(--tab-options-card-bg)] rounded-lg border border-[var(--tab-options-button-border)] hover:border-[var(--tab-options-button-primary-bg)] transition-colors"
          >
            {editingIndex === index ? (
              // 编辑模式
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="分组名称"
                  className="w-full px-3 py-2 text-sm border border-[var(--tab-options-button-border)] rounded-lg focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)] focus:border-transparent bg-[var(--tab-options-card-bg)] text-[var(--tab-options-title)]"
                  autoFocus
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="分组说明（可选）"
                  className="w-full px-3 py-2 text-sm border border-[var(--tab-options-button-border)] rounded-lg focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)] focus:border-transparent bg-[var(--tab-options-card-bg)] text-[var(--tab-options-text)]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg hover:bg-[var(--tab-options-button-primary-hover)] text-sm"
                  >
                    <Check className="w-4 h-4" />
                    保存
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[var(--tab-options-button-border)] text-[var(--tab-options-button-text)] rounded-lg hover:bg-[var(--tab-options-button-hover-bg)] text-sm"
                  >
                    <X className="w-4 h-4" />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 显示模式
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-medium text-[var(--tab-options-title)]">
                      {group.name}
                    </h4>
                    {group.count > 0 && (
                      <span className="px-2 py-0.5 bg-[var(--tab-popup-section-purple-badge-bg)] text-[var(--tab-popup-section-purple-badge-text)] rounded text-xs">
                        约 {group.count} 个
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-[var(--tab-options-text)] mt-1">
                      {group.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-2 text-[var(--tab-options-text)] hover:text-[var(--tab-options-button-primary-bg)] hover:bg-[var(--tab-options-button-hover-bg)] rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-2 text-[var(--tab-options-text)] hover:text-red-500 hover:bg-[var(--tab-options-button-hover-bg)] rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 添加新分组 */}
      {groups.length < 20 && (
        <div className="p-4 bg-[var(--tab-options-card-bg)] rounded-lg border border-dashed border-[var(--tab-options-button-border)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="添加新分组..."
              className="flex-1 px-3 py-2 text-sm border border-[var(--tab-options-button-border)] rounded-lg focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)] focus:border-transparent bg-[var(--tab-options-card-bg)] text-[var(--tab-options-title)]"
            />
            <button
              onClick={handleAdd}
              disabled={!newGroupName.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg hover:bg-[var(--tab-options-button-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      <div className="p-3 bg-[var(--tab-popup-section-purple-from)] rounded-lg border border-[var(--tab-popup-section-purple-border)]">
        <p className="text-sm text-[var(--tab-options-text)]">
          已设置 <span className="font-medium text-[var(--tab-options-title)]">{groups.length}</span> 个分组
          {groups.length < 3 && <span className="text-[var(--tab-options-text-muted)] ml-2">（建议至少 3 个分组）</span>}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-[var(--tab-options-button-border)] text-[var(--tab-options-button-text)] rounded-lg hover:bg-[var(--tab-options-button-hover-bg)] transition-colors"
        >
          返回
        </button>
        <button
          onClick={handleConfirm}
          disabled={groups.length === 0}
          className="flex-1 px-6 py-3 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg hover:bg-[var(--tab-options-button-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          确认分组（{groups.length}）
        </button>
      </div>
    </div>
  )
}
