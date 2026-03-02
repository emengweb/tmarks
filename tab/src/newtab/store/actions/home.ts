/**
 * 首页项目操作 Actions
 */

import type { Item } from '../../types/core'
import type { NewTabState } from '../types'
import { logger } from '@/lib/utils/logger'

export interface HomeActions {
  addHomeItem: (item: Omit<Item, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>) => string
  updateHomeItem: (id: string, updates: Partial<Omit<Item, 'groupId'>>) => void
  removeHomeItem: (id: string) => void
  moveHomeItem: (id: string, targetParentId: string | null) => void
  reorderHomeItems: (parentId: string | null, fromIndex: number, toIndex: number) => void
  getFilteredHomeItems: () => Item[]
  getHomeItemsByParent: (parentId: string | null) => Item[]
}

export function createHomeActions(
  get: () => NewTabState,
  set: (partial: Partial<NewTabState>) => void
): HomeActions {
  return {
    addHomeItem: (item: Omit<Item, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>) => {
      const state = get()
      const now = Date.now()
      
      const newItem: Item = {
        ...item,
        id: crypto.randomUUID(),
        groupId: '__home__', // 特殊标记，表示这是首页项目
        createdAt: now,
        updatedAt: now,
      }
      
      set({ homeItems: [...state.homeItems, newItem] })
      state.saveData()
      
      logger.info('[Home] Added home item:', newItem.id, newItem.type)
      return newItem.id
    },

    updateHomeItem: (id: string, updates: Partial<Omit<Item, 'groupId'>>) => {
      const state = get()
      const updatedHomeItems = state.homeItems.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: Date.now() }
          : item
      )
      
      set({ homeItems: updatedHomeItems })
      state.saveData()
      
      logger.info('[Home] Updated home item:', id)
    },

    removeHomeItem: (id: string) => {
      const state = get()
      
      // 递归删除子项目
      const getDescendantIds = (itemId: string): string[] => {
        const children = state.homeItems.filter(item => item.parentId === itemId)
        const childIds = children.map(child => child.id)
        const descendantIds = children.flatMap(child => getDescendantIds(child.id))
        return [...childIds, ...descendantIds]
      }
      
      const idsToRemove = [id, ...getDescendantIds(id)]
      const updatedHomeItems = state.homeItems.filter(item => !idsToRemove.includes(item.id))
      
      set({ homeItems: updatedHomeItems })
      state.saveData()
      
      logger.info('[Home] Removed home item and descendants:', id, idsToRemove.length)
    },

    moveHomeItem: (id: string, targetParentId: string | null) => {
      const state = get()
      const updatedHomeItems = state.homeItems.map(item =>
        item.id === id
          ? { ...item, parentId: targetParentId, updatedAt: Date.now() }
          : item
      )
      
      set({ homeItems: updatedHomeItems })
      state.saveData()
      
      logger.info('[Home] Moved home item:', id, 'to parent', targetParentId)
    },

    reorderHomeItems: (parentId: string | null, fromIndex: number, toIndex: number) => {
      const state = get()
      
      // 获取当前范围内的项目
      const scopedItems = state.homeItems.filter(item => item.parentId === parentId)
      
      // 排序
      const sortedItems = [...scopedItems].sort((a, b) => a.position - b.position)
      
      // 移动
      const [movedItem] = sortedItems.splice(fromIndex, 1)
      sortedItems.splice(toIndex, 0, movedItem)
      
      // 更新 position
      const updatedScopedItems = sortedItems.map((item, index) => ({
        ...item,
        position: index,
        updatedAt: Date.now(),
      }))
      
      // 合并回所有项目
      const itemMap = new Map(updatedScopedItems.map(item => [item.id, item]))
      const updatedHomeItems = state.homeItems.map(item => itemMap.get(item.id) || item)
      
      set({ homeItems: updatedHomeItems })
      state.saveData()
      
      logger.info('[Home] Reordered home items in parent:', parentId)
    },

    getFilteredHomeItems: () => {
      const state = get()
      return state.homeItems.filter(item => item.parentId === state.currentFolderId)
    },

    getHomeItemsByParent: (parentId: string | null) => {
      const state = get()
      return state.homeItems.filter(item => item.parentId === parentId)
    },
  }
}
