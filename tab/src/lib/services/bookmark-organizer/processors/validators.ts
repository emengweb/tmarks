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
 * 验证单个文件夹
 */
function validateFolder(folder: string, options: OrganizeOptions): string {
  const existingFolders = options.existingFolders || []
  const maxGroups = options.maxImportGroups || 7
  
  // 如果已有分组数量达到上限，且当前文件夹不在已有分组中
  if (existingFolders.length >= maxGroups && !existingFolders.includes(folder)) {
    return existingFolders.length > 0 ? existingFolders[0] : '其他'
  }
  
  return folder
}

/**
 * 验证并限制批量文件夹数量
 */
function validateAndLimitFolders(parsed: ParsedBookmarkData[], options: OrganizeOptions) {
  const existingFolders = options.existingFolders || []
  const maxGroups = options.maxImportGroups || 7
  const newFolders = new Set<string>()
  
  // 收集所有新文件夹
  parsed.forEach(item => {
    if (item.folder && !existingFolders.includes(item.folder)) {
      newFolders.add(item.folder)
    }
  })
  
  // 计算允许的新文件夹数量
  const allowedNewCount = Math.max(0, maxGroups - existingFolders.length)
  const allowedNewFolders = Array.from(newFolders).slice(0, allowedNewCount)
  const allowedFolderSet = new Set([...existingFolders, ...allowedNewFolders])
  
  // 将超出限制的文件夹重新分配
  parsed.forEach(item => {
    if (item.folder && !allowedFolderSet.has(item.folder)) {
      item.folder = existingFolders.length > 0 
        ? existingFolders[0] 
        : (allowedNewFolders.length > 0 ? allowedNewFolders[0] : '其他')
    }
  })
}
