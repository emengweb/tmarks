/**
 * 分组操作 Actions
 */

import type { Group } from '../../types/core'
import type { NewTabState, AddGroupOptions, RemoveGroupOptions, EnsureGroupOptions } from '../types'
import { logger } from '@/lib/utils/logger'

export interface GroupActions {
  addGroup: (name: string, icon: string, options?: AddGroupOptions) => void
  updateGroup: (id: string, updates: Partial<Group>) => void
  removeGroup: (id: string, options?: RemoveGroupOptions) => void
  reorderGroups: (fromIndex: number, toIndex: number) => void
  setGroupBookmarkFolderId: (groupId: string, folderId: string | null) => void
}

export function createGroupActions(
  get: () => NewTabState,
  set: (partial: Partial<NewTabState>) => void,
  _ensureGroupFolderId?: (groupId: string, options?: EnsureGroupOptions) => Promise<string | null>
): GroupActions {
  return {
    addGroup: (name: string, icon: string, options?: AddGroupOptions) => {
      const state = get()
      const now = Date.now()
      const maxPosition = Math.max(0, ...state.groups.map(g => g.position))
      
      const newGroup: Group = {
        id: crypto.randomUUID(),
        name,
        icon,
        position: maxPosition + 1,
        bookmarkFolderId: options?.bookmarkFolderId || undefined,
        createdAt: now,
        updatedAt: now,
      }
      
      set({ groups: [...state.groups, newGroup] })
      state.saveData()
      
      logger.info('[Groups] Added group:', newGroup.id, name)
    },

    updateGroup: (id: string, updates: Partial<Group>) => {
      const state = get()
      const updatedGroups = state.groups.map(group =>
        group.id === id
          ? { ...group, ...updates, updatedAt: Date.now() }
          : group
      )
      
      set({ groups: updatedGroups })
      state.saveData()
      
      logger.info('[Groups] Updated group:', id)
    },

    removeGroup: (id: string, _options?: RemoveGroupOptions) => {
      const state = get()
      
      // 删除分组
      const updatedGroups = state.groups.filter(g => g.id !== id)
      
      // 删除该分组下的所有项目
      const updatedItems = state.items.filter(item => item.groupId !== id)
      
      // 如果删除的是当前激活分组，切换到首页
      let newActiveView = state.activeView
      let newActiveGroupId = state.activeGroupId
      
      if (state.activeGroupId === id) {
        newActiveView = 'home'
        newActiveGroupId = null
      }
      
      set({
        groups: updatedGroups,
        items: updatedItems,
        activeView: newActiveView,
        activeGroupId: newActiveGroupId,
        currentFolderId: null,
      })
      
      state.saveData()
      
      logger.info('[Groups] Removed group:', id)
    },

    reorderGroups: (fromIndex: number, toIndex: number) => {
      const state = get()
      const groups = [...state.groups]
      const [movedGroup] = groups.splice(fromIndex, 1)
      groups.splice(toIndex, 0, movedGroup)
      
      // 更新 position
      const updatedGroups = groups.map((group, index) => ({
        ...group,
        position: index,
        updatedAt: Date.now(),
      }))
      
      set({ groups: updatedGroups })
      state.saveData()
      
      logger.info('[Groups] Reordered groups')
    },

    setGroupBookmarkFolderId: (groupId: string, folderId: string | null) => {
      const state = get()
      const updatedGroups = state.groups.map(group =>
        group.id === groupId
          ? { ...group, bookmarkFolderId: folderId || undefined, updatedAt: Date.now() }
          : group
      )
      
      set({ groups: updatedGroups })
      state.saveData()
      
      logger.info('[Groups] Set bookmark folder ID:', groupId, folderId)
    },
  }
}
