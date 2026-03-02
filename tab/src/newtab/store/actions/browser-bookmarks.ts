/**
 * 浏览器书签同步 Actions
 */

import type { NewTabState, BookmarkNodeInfo, ReplaceItemsOptions, EnsureGroupOptions } from '../types'
import type { Item } from '../../types/core'
import { logger } from '@/lib/utils/logger'

export function createBrowserBookmarkActions(
  get: () => NewTabState,
  set: (partial: Partial<NewTabState>) => void
) {
  return {
    setBrowserBookmarksRootId: (rootId: string | null) => {
      set({ browserBookmarksRootId: rootId })
      get().saveData()
    },

    setHomeBrowserFolderId: (folderId: string | null) => {
      set({ homeBrowserFolderId: folderId })
      get().saveData()
    },

    setIsApplyingBrowserBookmarks: (isApplying: boolean) => {
      set({ isApplyingBrowserBookmarks: isApplying })
    },

    setBrowserBookmarkWriteLockUntil: (until: number) => {
      set({ browserBookmarkWriteLockUntil: until })
    },

    ensureGroupBookmarkFolderId: async (groupId: string, options?: EnsureGroupOptions) => {
      const state = get()
      const group = state.groups.find(g => g.id === groupId)
      if (!group) return null

      if (group.bookmarkFolderId) {
        return group.bookmarkFolderId
      }

      if (options?.bookmarkFolderIdOverride) {
        state.setGroupBookmarkFolderId(groupId, options.bookmarkFolderIdOverride)
        return options.bookmarkFolderIdOverride
      }

      if (!options?.createIfMissing) {
        return null
      }

      if (typeof chrome === 'undefined' || !chrome.bookmarks) {
        return null
      }

      try {
        const rootId = state.browserBookmarksRootId
        if (!rootId) return null

        const created = await chrome.bookmarks.create({
          parentId: rootId,
          title: group.name,
        })

        if (created) {
          state.setGroupBookmarkFolderId(groupId, created.id)
          return created.id
        }
      } catch (error) {
        logger.error('[Store] Failed to create bookmark folder for group:', groupId, error)
      }

      return null
    },

    upsertBrowserBookmarkNode: (node: BookmarkNodeInfo) => {
      const { items, homeItems, homeBrowserFolderId } = get()
      const gridId = `bb-${node.id}`
      
      const isHomeItem = node.parentId === homeBrowserFolderId || 
                         homeItems.some(i => i.browserBookmarkId === node.parentId)
      
      if (isHomeItem) {
        const existingIndex = homeItems.findIndex(i => i.id === gridId)
        
        if (existingIndex >= 0) {
          const existing = homeItems[existingIndex]
          const updated: Item = {
            ...existing,
            data: existing.type === 'shortcut' 
              ? {
                  type: 'shortcut',
                  url: node.url || (existing.data as any).url || '',
                  title: node.title || (existing.data as any).title || '',
                  favicon: (existing.data as any).favicon,
                  clickCount: (existing.data as any).clickCount || 0,
                }
              : {
                  type: 'folder',
                  title: node.title || (existing.data as any).title || '',
                  icon: (existing.data as any).icon,
                  isExpanded: (existing.data as any).isExpanded,
                },
            updatedAt: Date.now(),
          }
          
          const newHomeItems = [...homeItems]
          newHomeItems[existingIndex] = updated
          set({ homeItems: newHomeItems })
        } else {
          const parentGridId = node.parentId && node.parentId !== homeBrowserFolderId 
            ? `bb-${node.parentId}` 
            : null
          
          const newItem: Item = node.url
            ? {
                id: gridId,
                type: 'shortcut',
                groupId: '__home__',
                parentId: parentGridId,
                position: node.index ?? homeItems.filter(i => i.parentId === parentGridId).length,
                browserBookmarkId: node.id,
                data: {
                  type: 'shortcut',
                  url: node.url,
                  title: node.title || node.url,
                  clickCount: 0,
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
            : {
                id: gridId,
                type: 'folder',
                groupId: '__home__',
                parentId: parentGridId,
                position: node.index ?? homeItems.filter(i => i.parentId === parentGridId).length,
                browserBookmarkId: node.id,
                data: {
                  type: 'folder',
                  title: node.title || '',
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
          
          set({ homeItems: [...homeItems, newItem] })
        }
      } else {
        const existingIndex = items.findIndex(i => i.id === gridId)
        
        if (existingIndex >= 0) {
          const existing = items[existingIndex]
          const updated: Item = {
            ...existing,
            data: existing.type === 'shortcut' 
              ? {
                  type: 'shortcut',
                  url: node.url || (existing.data as any).url || '',
                  title: node.title || (existing.data as any).title || '',
                  favicon: (existing.data as any).favicon,
                  clickCount: (existing.data as any).clickCount || 0,
                }
              : {
                  type: 'folder',
                  title: node.title || (existing.data as any).title || '',
                  icon: (existing.data as any).icon,
                  isExpanded: (existing.data as any).isExpanded,
                },
            updatedAt: Date.now(),
          }
          
          const newItems = [...items]
          newItems[existingIndex] = updated
          set({ items: newItems })
        } else {
          const parentGridId = node.parentId ? `bb-${node.parentId}` : null
          const parentItem = parentGridId ? items.find(i => i.id === parentGridId) : null
          const groupId = parentItem?.groupId || '__home__'
          
          const newItem: Item = node.url
            ? {
                id: gridId,
                type: 'shortcut',
                groupId,
                parentId: parentGridId,
                position: node.index ?? items.filter(i => i.parentId === parentGridId).length,
                browserBookmarkId: node.id,
                data: {
                  type: 'shortcut',
                  url: node.url,
                  title: node.title || node.url,
                  clickCount: 0,
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
            : {
                id: gridId,
                type: 'folder',
                groupId,
                parentId: parentGridId,
                position: node.index ?? items.filter(i => i.parentId === parentGridId).length,
                browserBookmarkId: node.id,
                data: {
                  type: 'folder',
                  title: node.title || '',
                },
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
          
          set({ items: [...items, newItem] })
        }
      }
      
      get().saveData()
    },

    removeBrowserBookmarkById: (bookmarkId: string) => {
      const { items, homeItems } = get()
      const gridId = `bb-${bookmarkId}`
      
      const isInHome = homeItems.some(i => i.id === gridId)
      
      if (isInHome) {
        const toRemove = new Set<string>()
        const collectChildren = (id: string) => {
          toRemove.add(id)
          homeItems.filter(i => i.parentId === id).forEach(child => collectChildren(child.id))
        }
        collectChildren(gridId)
        
        const newHomeItems = homeItems.filter(i => !toRemove.has(i.id))
        set({ homeItems: newHomeItems })
      } else {
        const toRemove = new Set<string>()
        const collectChildren = (id: string) => {
          toRemove.add(id)
          items.filter(i => i.parentId === id).forEach(child => collectChildren(child.id))
        }
        collectChildren(gridId)
        
        const newItems = items.filter(i => !toRemove.has(i.id))
        set({ items: newItems })
      }
      
      get().saveData()
    },

    applyBrowserBookmarkChildrenOrder: (parentBookmarkId: string, orderedChildBookmarkIds: string[]) => {
      const { items, homeItems, homeBrowserFolderId } = get()
      const parentGridId = `bb-${parentBookmarkId}`
      
      const isHomeParent = parentBookmarkId === homeBrowserFolderId || 
                           homeItems.some(i => i.browserBookmarkId === parentBookmarkId)
      
      if (isHomeParent) {
        const newHomeItems = homeItems.map(item => {
          if (item.parentId === parentGridId && item.browserBookmarkId) {
            const newPosition = orderedChildBookmarkIds.indexOf(item.browserBookmarkId)
            if (newPosition >= 0 && newPosition !== item.position) {
              return { ...item, position: newPosition, updatedAt: Date.now() }
            }
          }
          return item
        })
        
        set({ homeItems: newHomeItems })
      } else {
        const newItems = items.map(item => {
          if (item.parentId === parentGridId && item.browserBookmarkId) {
            const newPosition = orderedChildBookmarkIds.indexOf(item.browserBookmarkId)
            if (newPosition >= 0 && newPosition !== item.position) {
              return { ...item, position: newPosition, updatedAt: Date.now() }
            }
          }
          return item
        })
        
        set({ items: newItems })
      }
      
      get().saveData()
    },

    replaceBrowserBookmarkItems: (newItems: Item[], options?: ReplaceItemsOptions) => {
      const { items } = get()
      const groupIds = options?.groupIds
      
      const filtered = items.filter(item => {
        if (!item.browserBookmarkId) return true
        if (!groupIds) return false
        return !groupIds.includes(item.groupId)
      })
      
      set({ items: [...filtered, ...newItems] })
      get().saveData()
    },

    mirrorHomeItemsToBrowser: async (ids: string[]) => {
      const state = get()
      if (typeof chrome === 'undefined' || !chrome.bookmarks) return
      if (!state.homeBrowserFolderId) return

      try {
        const itemsToMirror = state.items.filter(item => ids.includes(item.id))
        
        for (const item of itemsToMirror) {
          if (item.browserBookmarkId) continue
          
          if (item.type === 'shortcut') {
            const data = item.data as { url: string; title: string }
            const created = await chrome.bookmarks.create({
              parentId: state.homeBrowserFolderId,
              title: data.title,
              url: data.url,
            })
            
            if (created) {
              state.updateItem(item.id, { browserBookmarkId: created.id })
            }
          } else if (item.type === 'folder') {
            const data = item.data as { title: string }
            const created = await chrome.bookmarks.create({
              parentId: state.homeBrowserFolderId,
              title: data.title,
            })
            
            if (created) {
              state.updateItem(item.id, { browserBookmarkId: created.id })
              
              const children = state.items.filter(i => i.parentId === item.id)
              if (children.length > 0) {
                for (const child of children) {
                  if (child.type === 'shortcut') {
                    const childData = child.data as { url: string; title: string }
                    const childCreated = await chrome.bookmarks.create({
                      parentId: created.id,
                      title: childData.title,
                      url: childData.url,
                    })
                    if (childCreated) {
                      state.updateItem(child.id, { browserBookmarkId: childCreated.id })
                    }
                  }
                }
              }
            }
          }
        }
        
        state.saveData()
        logger.info('[Store] Mirrored items to browser:', ids.length)
      } catch (error) {
        logger.error('[Store] Failed to mirror items to browser:', error)
      }
    },
  }
}
