/**
 * NewTab 辅助工具函数
 */

import type { Item, Group } from '../types/core'

// ============================================
// 项目查询
// ============================================

export function getItemsByGroup(items: Item[], groupId: string): Item[] {
  return items.filter(item => item.groupId === groupId)
}

export function getItemsByParent(items: Item[], parentId: string | null): Item[] {
  return items.filter(item => item.parentId === parentId)
}

export function getItemChildren(items: Item[], itemId: string): Item[] {
  return items.filter(item => item.parentId === itemId)
}

export function getItemDescendants(items: Item[], itemId: string): Item[] {
  const children = getItemChildren(items, itemId)
  const descendants = children.flatMap(child => getItemDescendants(items, child.id))
  return [...children, ...descendants]
}

export function getItemAncestors(items: Item[], itemId: string): Item[] {
  const item = items.find(i => i.id === itemId)
  if (!item || !item.parentId) return []
  
  const parent = items.find(i => i.id === item.parentId)
  if (!parent) return []
  
  return [parent, ...getItemAncestors(items, parent.id)]
}

export function getItemPath(items: Item[], itemId: string): Item[] {
  const item = items.find(i => i.id === itemId)
  if (!item) return []
  
  const ancestors = getItemAncestors(items, itemId)
  return [...ancestors.reverse(), item]
}

// ============================================
// 项目排序
// ============================================

export function sortItemsByPosition(items: Item[]): Item[] {
  return [...items].sort((a, b) => a.position - b.position)
}

export function reorderItems(items: Item[], fromIndex: number, toIndex: number): Item[] {
  const sorted = sortItemsByPosition(items)
  const [movedItem] = sorted.splice(fromIndex, 1)
  sorted.splice(toIndex, 0, movedItem)
  
  return sorted.map((item, index) => ({
    ...item,
    position: index,
    updatedAt: Date.now(),
  }))
}

// ============================================
// 分组查询
// ============================================

export function getGroupById(groups: Group[], groupId: string): Group | undefined {
  return groups.find(g => g.id === groupId)
}

export function sortGroupsByPosition(groups: Group[]): Group[] {
  return [...groups].sort((a, b) => a.position - b.position)
}

// ============================================
// 验证
// ============================================

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidGroupId(groups: Group[], groupId: string): boolean {
  return groups.some(g => g.id === groupId)
}

export function isValidParentId(items: Item[], parentId: string | null): boolean {
  if (parentId === null) return true
  const parent = items.find(i => i.id === parentId)
  return parent?.type === 'folder'
}

// ============================================
// 统计
// ============================================

export function countItemsByGroup(items: Item[], groupId: string): number {
  return items.filter(item => item.groupId === groupId).length
}

export function countItemsByType(items: Item[], type: string): number {
  return items.filter(item => item.type === type).length
}

export function getTotalClickCount(items: Item[]): number {
  return items.reduce((total, item) => {
    if (item.type === 'shortcut') {
      return total + ((item.data as any).clickCount || 0)
    }
    return total
  }, 0)
}
