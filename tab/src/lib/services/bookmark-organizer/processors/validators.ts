/**
 * 书签数据验证和转换
 */

import type { EditableBookmark } from '@/options/components/import/EditableBookmarkTable'
import type { OrganizeOptions, ParsedBookmarkData } from '../types'

/**
 * 验证并转换单个书签
 */
export function validateAndTransformBookmark(
  url: string,
  parsed: ParsedBookmarkData,
  options: OrganizeOptions
): EditableBookmark {
  // 验证标签数量（TMarks）
  if (options.mode === 'tmarks' && options.tagCountMin && options.tagCountMax) {
    parsed.tags = validateTagCount(parsed.tags || [], options.tagCountMin, options.tagCountMax)
  }

  // 验证文件夹（NewTab）
  if (options.mode === 'newtab' && parsed.folder) {
    parsed.folder = validateFolder(parsed.folder, options)
  }

  const existingTagSet = new Set((options.existingTags || []).map(t => t.toLowerCase()))

  return {
    url,
    title: parsed.title || url,
    description: parsed.description || '',
    note: parsed.description || '',
    tags: (parsed.tags || []).map(tagName => ({
      name: tagName,
      isNew: !existingTagSet.has(tagName.toLowerCase()),
      confidence: 0.8
    })),
    folder: parsed.folder,
    isSelected: true,
    isSkipped: false
  }
}

/**
 * 验证并转换批量书签
 */
export function validateAndTransformBatchBookmarks(
  urls: string[],
  parsed: ParsedBookmarkData[],
  options: OrganizeOptions
): EditableBookmark[] {
  const existingTagSet = new Set((options.existingTags || []).map(t => t.toLowerCase()))
  
  // NewTab 模式：验证文件夹数量
  if (options.mode === 'newtab') {
    validateAndLimitFolders(parsed, options)
  }

  return urls.map((url, index) => {
    const item = parsed[index] || { title: url, description: '', tags: [] }
    
    // 验证标签数量（TMarks）
    if (options.mode === 'tmarks' && options.tagCountMin && options.tagCountMax) {
      item.tags = validateTagCount(item.tags || [], options.tagCountMin, options.tagCountMax)
    }
    
    return {
      url,
      title: item.title || url,
      description: item.description || '',
      note: item.description || '',
      tags: (item.tags || []).map(tagName => ({
        name: tagName,
        isNew: !existingTagSet.has(tagName.toLowerCase()),
        confidence: 0.8
      })),
      folder: item.folder,
      isSelected: true,
      isSkipped: false
    }
  })
}

/**
 * 验证标签数量
 */
function validateTagCount(tags: string[], min: number, max: number): string[] {
  const tagCount = tags.length
  
  if (tagCount < min) {
    // 不足时补充"其他"标签
    while (tags.length < min) {
      tags.push('其他')
    }
  } else if (tagCount > max) {
    // 超出时截断
    tags = tags.slice(0, max)
  }
  
  return tags
}

/**
 * 验证单个文件夹（方案 A：渐进式上限）
 */
function validateFolder(folder: string, options: OrganizeOptions): string {
  const existingFolders = options.existingFolders || []
  const maxTotalGroups = 10 // 总上限调整为 10
  
  // 如果是已有文件夹，直接返回
  if (existingFolders.includes(folder)) {
    return folder
  }
  
  // 如果已达到总上限，使用第一个已有文件夹或"其他"
  if (existingFolders.length >= maxTotalGroups) {
    return existingFolders.length > 0 ? existingFolders[0] : '其他'
  }
  
  // 允许创建新文件夹
  return folder
}

/**
 * 验证并限制批量文件夹数量（方案 A：渐进式上限）
 */
function validateAndLimitFolders(parsed: ParsedBookmarkData[], options: OrganizeOptions) {
  const existingFolders = options.existingFolders || []
  const maxTotalGroups = 10 // 总上限调整为 10
  const newFolders = new Set<string>()
  
  // 收集所有新文件夹
  parsed.forEach(item => {
    if (item.folder && !existingFolders.includes(item.folder)) {
      newFolders.add(item.folder)
    }
  })
  
  // 计算允许的新文件夹数量
  const allowedNewCount = Math.max(0, maxTotalGroups - existingFolders.length)
  
  // 如果新文件夹数量在允许范围内，直接返回
  if (newFolders.size <= allowedNewCount) {
    return
  }
  
  // 超出限制：按出现频率排序，保留最常用的
  const folderCounts = new Map<string, number>()
  parsed.forEach(item => {
    if (item.folder && !existingFolders.includes(item.folder)) {
      folderCounts.set(item.folder, (folderCounts.get(item.folder) || 0) + 1)
    }
  })
  
  const sortedNewFolders = Array.from(folderCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, allowedNewCount)
    .map(([folder]) => folder)
  
  const allowedFolderSet = new Set([...existingFolders, ...sortedNewFolders])
  
  // 将超出限制的文件夹重新分配到最相似的允许文件夹
  parsed.forEach(item => {
    if (item.folder && !allowedFolderSet.has(item.folder)) {
      // 优先分配到已有文件夹
      item.folder = existingFolders.length > 0 
        ? existingFolders[0] 
        : (sortedNewFolders.length > 0 ? sortedNewFolders[0] : '其他')
    }
  })
}
