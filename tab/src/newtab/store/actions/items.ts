/**
 * 项目操作 Actions
 */

import type { Item } from '../../types/core'
import type { NewTabState } from '../types'
import { logger } from '@/lib/utils/logger'

export interface ItemActions {
  addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateItem: (id: string, updates: Partial<Item>) => void
  removeItem: (id: string) => void
  moveItem: (id: string, targetGroupId: string, targetParentId: string | null) => void
  reorderItems: (groupId: string, parentId: string | null, fromIndex: number, toIndex: number) => void
  incrementClickCount: (id: string) => void
  getFilteredItems: () => Item[]
  getItemsByGroup: (groupId: string) => Item[]
  getItemsByParent: (parentId: string | null) => Item[]
  getItemChildren: (itemId: string) => Item[]
}

export function createItemActions(
  get: () => NewTabState,
  set: (partial: Partial<NewTabState>) => void
): ItemActions {
  return {
    addItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => {
      const state = get()
      const now = Date.now()
      
      const newItem: Item = {
        ...item,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      }
      
      set({ items: [...state.items, newItem] })
      state.saveData()
      
      logger.info('[Items] Added item:', newItem.id, newItem.type)
      return newItem.id
    },

    updateItem: (id: string, updates: Partial<Item>) => {
      const state = get()
      const updatedItems = state.items.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: Date.now() }
          : item
      )
      
      set({ items: updatedItems })
      state.saveData()
      
      logger.info('[Items] Updated item:', id)
    },

    removeItem: (id: string) => {
      const state = get()
      
      // 递归删除子项目
      const getDescendantIds = (itemId: string): string[] => {
        const children = state.items.filter(item => item.parentId === itemId)
        const childIds = children.map(child => child.id)
        const descendantIds = children.flatMap(child => getDescendantIds(child.id))
        return [...childIds, ...descendantIds]
      }
      
      const idsToRemove = [id, ...getDescendantIds(id)]
      const updatedItems = state.items.filter(item => !idsToRemove.includes(item.id))
      
      set({ items: updatedItems })
      state.saveData()
      
      logger.info('[Items] Removed item and descendants:', id, idsToRemove.length)
    },

    moveItem: (id: string, targetGroupId: string, targetParentId: string | null) => {
      const state = get()
      const updatedItems = state.items.map(item =>
        item.id === id
          ? { ...item, groupId: targetGroupId, parentId: targetParentId, updatedAt: Date.now() }
          : item
      )
      
      set({ items: updatedItems })
      state.saveData()
      
      logger.info('[Items] Moved item:', id, 'to', targetGroupId, targetParentId)
    },

    reorderItems: (groupId: string, parentId: string | null, fromIndex: number, toIndex: number) => {
      const state = get()
      
      // 获取当前范围内的项目
      const scopedItems = state.items.filter(
        item => item.groupId === groupId && item.parentId === parentId
      )
      
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
      const updatedItems = state.items.map(item => itemMap.get(item.id) || item)
      
      set({ items: updatedItems })
      state.saveData()
      
      logger.info('[Items] Reordered items in scope:', groupId, parentId)
    },

    incrementClickCount: (id: string) => {
      const state = get()
      const updatedItems = state.items.map(item => {
        if (item.id === id && item.type === 'shortcut') {
          const shortcutData = item.data as { type: 'shortcut'; url: string; title: string; favicon?: string; clickCount?: number; lastClickedAt?: number }
          return {
            ...item,
            data: {
              ...shortcutData,
              clickCount: (shortcutData.clickCount || 0) + 1,
              lastClickedAt: Date.now(),
            },
            updatedAt: Date.now(),
          }
        }
        return item
      })
      
      set({ items: updatedItems })
      state.saveData()
    },

    getFilteredItems: () => {
      const state = get()
      return state.items.filter(
        item => item.groupId === state.activeGroupId && item.parentId === state.currentFolderId
      )
    },

    getItemsByGroup: (groupId: string) => {
      const state = get()
      return state.items.filter(item => item.groupId === groupId)
    },

    getItemsByParent: (parentId: string | null) => {
      const state = get()
      return state.items.filter(item => item.parentId === parentId)
    },

    getItemChildren: (itemId: string) => {
      const state = get()
      return state.items.filter(item => item.parentId === itemId)
    },
  }
}
