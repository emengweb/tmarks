/**
 * AI 响应解析器
 */

import type { ParsedBookmarkData } from './types'

/**
 * 解析单个 AI 返回的内容
 */
export function parseAIResponse(content: string): ParsedBookmarkData {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    return {
      title: parsed.title || parsed.Title || '',
      description: parsed.description || parsed.Description || '',
      tags: parsed.tags || parsed.Tags || [],
      folder: parsed.folder || parsed.Folder || ''
    }
  } catch (error) {
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * 解析批量 AI 返回的内容
 */
export function parseBatchAIResponse(content: string): ParsedBookmarkData[] {
  try {
    let cleanContent = content.trim()
    cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    let jsonStr = jsonMatch[0]
    
    // 修复常见的 JSON 错误
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1')
    jsonStr = jsonStr.replace(/\}(\s*)\{/g, '},$1{')
    
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array')
    }

    return parsed.map(item => ({
      title: item.title || item.Title || '',
      description: item.description || item.Description || '',
      tags: item.tags || item.Tags || [],
      folder: item.folder || item.Folder || ''
    }))
  } catch (error) {
    throw new Error(`Failed to parse batch AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
