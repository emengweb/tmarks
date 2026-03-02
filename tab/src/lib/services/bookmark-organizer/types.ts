/**
 * 书签整理器类型定义
 */

import type { AIProvider } from '@/types'
import type { EditableBookmark } from '@/options/components/import/EditableBookmarkTable'

export interface OrganizeOptions {
  provider: AIProvider
  apiKey: string
  model?: string
  apiUrl?: string
  concurrency?: number // 并发数，默认 3
  existingTags?: string[] // 已有标签列表（TMarks）
  mode?: 'tmarks' | 'newtab' // 整理模式：tmarks=标签，newtab=文件夹
  tagStyle?: string // 用户自定义标签风格（TMarks）
  existingFolders?: string[] // 已有文件夹列表（NewTab）
  maxImportGroups?: number // AI 批量导入最多创建的分组数量（NewTab），默认 7
  temperature?: number // AI 创造性，默认 0.7
  batchDelay?: number // 批处理延迟（毫秒），默认 500
  // 新增：用户设置
  titleLength?: 'short' | 'medium' | 'long' // 标题长度
  descriptionDetail?: 'minimal' | 'short' | 'detailed' // 描述详细度
  tagCountMin?: number // 最少标签数（TMarks）
  tagCountMax?: number // 最多标签数（TMarks）
  language?: 'zh' | 'en' | 'mixed' // 语言偏好
  // 批量处理模式
  batchMode?: 'single' | 'batch' // single=逐个处理，batch=批量处理
  batchSize?: number // 批量处理时每批的 URL 数量，默认 5
}

export interface SuggestedGroup {
  name: string
  description: string
  count: number // 预计包含的 URL 数量
}

export interface OrganizeProgress {
  current: number
  total: number
  status: string
  successCount: number
  failedCount: number
  latestBookmark?: EditableBookmark // 最新完成的书签
}

export interface OrganizeResult {
  bookmarks: EditableBookmark[]
  successCount: number
  failedCount: number
  errors: Array<{ url: string; error: string }>
}

export interface ParsedBookmarkData {
  title?: string
  description?: string
  tags?: string[]
  folder?: string
}
