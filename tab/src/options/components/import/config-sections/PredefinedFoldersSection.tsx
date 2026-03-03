/**
 * 预定义分组配置 Section (NewTab 专用)
 */

import { Folder, X } from 'lucide-react'
import { useState } from 'react'

interface PredefinedFoldersSectionProps {
  predefinedFolders: string[]
  setPredefinedFolders: (folders: string[]) => void
  existingFolders: string[]
}

export function PredefinedFoldersSection({
  predefinedFolders,
  setPredefinedFolders,
  existingFolders
}: PredefinedFoldersSectionProps) {
  const [newFolder, setNewFolder] = useState('')
  
  const totalCount = existingFolders.length + predefinedFolders.length
  const canAddMore = totalCount < 10
  const remainingSlots = 10 - totalCount

  const handleAddFolder = () => {
    const trimmed = newFolder.trim()
    if (!trimmed) return
    
    // 检查是否重复
    if (predefinedFolders.includes(trimmed)) {
      return
    }
    
    // 检查总数量限制（已有 + 预定义不能超过 10）
    const totalCount = existingFolders.length + predefinedFolders.length
    if (totalCount >= 10) {
      return
    }
    
    setPredefinedFolders([...predefinedFolders, trimmed])
    setNewFolder('')
  }

  const handleRemoveFolder = (folder: string) => {
    setPredefinedFolders(predefinedFolders.filter(f => f !== folder))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Folder className="w-4 h-4 text-[var(--tab-options-text)]" />
        <span className="text-sm font-medium text-[var(--tab-options-text)]">预定义分组</span>
      </div>
      <div className="p-4 bg-[var(--tab-options-card-bg)] rounded-lg border border-[var(--tab-options-button-border)] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--tab-options-text)]">
            设置参考分组，AI 会优先使用这些分组。不设置则由 AI 自动推荐。
          </p>
          {!canAddMore && (
            <span className="text-xs text-red-400 whitespace-nowrap ml-2">
              已达上限
            </span>
          )}
        </div>
        
        {existingFolders.length > 0 && (
          <div>
            <p className="text-xs text-[var(--tab-options-text-muted)] mb-2">
              已有分组（{existingFolders.length}/10）：
            </p>
            <div className="flex flex-wrap gap-2">
              {existingFolders.map(folder => (
                <span
                  key={folder}
                  className="px-2 py-1 bg-[var(--tab-popup-section-purple-badge-bg)]/20 text-[var(--tab-options-text)] text-xs rounded"
                >
                  {folder}
                </span>
              ))}
            </div>
          </div>
        )}

        {predefinedFolders.length > 0 && (
          <div>
            <p className="text-xs text-[var(--tab-options-text)] mb-2">
              预定义分组（{predefinedFolders.length} 个）：
            </p>
            <div className="flex flex-wrap gap-2">
              {predefinedFolders.map(folder => (
                <span
                  key={folder}
                  className="px-2 py-1 bg-[var(--tab-popup-section-purple-badge-bg)] text-white text-xs rounded flex items-center gap-1"
                >
                  {folder}
                  <button
                    onClick={() => handleRemoveFolder(folder)}
                    className="hover:bg-white/20 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddFolder()}
            placeholder={canAddMore ? `输入分组名称（还可添加 ${remainingSlots} 个）` : '已达上限'}
            disabled={!canAddMore}
            className="flex-1 px-3 py-2 bg-[var(--tab-options-input-bg)] border border-[var(--tab-options-button-border)] rounded-lg text-sm text-[var(--tab-options-text)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleAddFolder}
            disabled={!newFolder.trim() || !canAddMore}
            className="px-4 py-2 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}
