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

  const handleAddFolder = () => {
    if (newFolder.trim() && !predefinedFolders.includes(newFolder.trim())) {
      setPredefinedFolders([...predefinedFolders, newFolder.trim()])
      setNewFolder('')
    }
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
        <p className="text-xs text-[var(--tab-options-text)]">
          如果不设置，AI 会自动推荐分组。设置后将跳过推荐步骤。
        </p>
        
        {existingFolders.length > 0 && (
          <div>
            <p className="text-xs text-[var(--tab-options-text)] mb-2">
              已有分组（{existingFolders.length} 个）：
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
            placeholder="输入分组名称"
            className="flex-1 px-3 py-2 bg-[var(--tab-options-input-bg)] border border-[var(--tab-options-button-border)] rounded-lg text-sm text-[var(--tab-options-text)]"
          />
          <button
            onClick={handleAddFolder}
            disabled={!newFolder.trim()}
            className="px-4 py-2 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg text-sm disabled:opacity-50"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}
