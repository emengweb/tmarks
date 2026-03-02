/**
 * 快捷方式辅助函数
 */

import type { Item, ShortcutItem } from '../types/core'
import { isShortcut } from '../types/core'
import { FAVICON_API } from '../constants/index'

// ============================================
// Favicon 处理
// ============================================

export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname
    return `${FAVICON_API}${domain}&sz=64`
  } catch {
    return ''
  }
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

// ============================================
// 快捷方式过滤
// ============================================

export function getShortcuts(items: Item[]): ShortcutItem[] {
  return items.filter(isShortcut)
}

export function getShortcutsByGroup(items: Item[], groupId: string): ShortcutItem[] {
  return items.filter(item => item.groupId === groupId && isShortcut(item)) as ShortcutItem[]
}

export function getMostClickedShortcuts(items: Item[], limit: number = 10): ShortcutItem[] {
  const shortcuts = getShortcuts(items)
  return shortcuts
    .sort((a, b) => b.data.clickCount - a.data.clickCount)
    .slice(0, limit)
}

export function getRecentlyClickedShortcuts(items: Item[], limit: number = 10): ShortcutItem[] {
  const shortcuts = getShortcuts(items)
  return shortcuts
    .filter(s => s.data.lastClickedAt)
    .sort((a, b) => (b.data.lastClickedAt || 0) - (a.data.lastClickedAt || 0))
    .slice(0, limit)
}

// ============================================
// 搜索
// ============================================

export function searchShortcuts(items: Item[], query: string): ShortcutItem[] {
  const shortcuts = getShortcuts(items)
  const lowerQuery = query.toLowerCase()
  
  return shortcuts.filter(shortcut => {
    const title = shortcut.data.title.toLowerCase()
    const url = shortcut.data.url.toLowerCase()
    return title.includes(lowerQuery) || url.includes(lowerQuery)
  })
}

// ============================================
// 验证
// ============================================

export function isValidShortcutUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeUrl(url: string): string {
  try {
    // 如果没有协议，添加 https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    const parsed = new URL(url)
    return parsed.href
  } catch {
    return url
  }
}
