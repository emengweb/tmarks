/**
 * 文件夹操作 Actions
 */

import type { NewTabState } from '../types'
import { logger } from '@/lib/utils/logger'

export interface FolderActions {
  setCurrentFolder: (folderId: string | null) => void
  removeFolder: (id: string, mode: 'keep' | 'all') => void
}

export function createFolderActions(
  get: () => NewTabState,
  set: (partial: Partial<NewTabState>) => void
): FolderActions {
  return {
    setCurrentFolder: (folderId: string | null) => {
      set({ currentFolderId: folderId })
      logger.info('[Folders] Set current folder:', folderId)
    },

    removeFolder: (id: string, mode: 'keep' | 'all') => {
      const state = get()
      
      // 判断文件夹在首页还是分组
      const isInHome = state.homeItems.some(item => item.id === id)
      
      if (mode === 'keep') {
        // 保留子项目，将它们移到父级
        if (isInHome) {
          const folder = state.homeItems.find(item => item.id === id)
          if (!folder) return
          
          const updatedHomeItems = state.homeItems
            .filter(item => item.id !== id)
            .map(item =>
              item.parentId === id
                ? { ...item, parentId: folder.parentId, updatedAt: Date.now() }
                : item
            )
          
          set({ homeItems: updatedHomeItems })
          logger.info('[Folders] Removed home folder (keep children):', id)
        } else {
          const folder = state.items.find(item => item.id === id)
          if (!folder) return
          
          const updatedItems = state.items
            .filter(item => item.id !== id)
            .map(item =>
              item.parentId === id
                ? { ...item, parentId: folder.parentId, updatedAt: Date.now() }
                : item
            )
          
          set({ items: updatedItems })
          logger.info('[Folders] Removed folder (keep children):', id)
        }
      } else {
        // 删除文件夹及所有子项目
        if (isInHome) {
          state.removeHomeItem(id)
          logger.info('[Folders] Removed home folder (delete all):', id)
        } else {
          state.removeItem(id)
          logger.info('[Folders] Removed folder (delete all):', id)
        }
      }
      
      // 如果删除的是当前文件夹，返回上一级
      if (state.currentFolderId === id) {
        set({ currentFolderId: null })
      }
      
      state.saveData()
    },
  }
}
