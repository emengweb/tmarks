/**
 * 批量 URL 处理器
 */

import { callAI } from '../../ai-client'
import type { EditableBookmark } from '@/options/components/import/EditableBookmarkTable'
import { TIMEOUTS } from '../../../constants/timeouts'
import type { OrganizeOptions, OrganizeProgress, OrganizeResult } from '../types'
import { buildTMarksBatchPrompt, buildNewTabBatchPrompt } from '../prompts'
import { parseBatchAIResponse } from '../parsers'
import { validateAndTransformBatchBookmarks } from './validators'

export class BatchUrlProcessor {
  private aborted = false
  private paused = false

  /**
   * 批量处理 URL
   */
  async process(
    urls: string[],
    options: OrganizeOptions,
    onProgress?: (progress: OrganizeProgress) => void
  ): Promise<OrganizeResult> {
    this.aborted = false
    this.paused = false
    
    const batchSize = options.batchSize || 5
    const batchDelay = options.batchDelay || TIMEOUTS.BATCH_DELAY
    const bookmarks: EditableBookmark[] = []
    const errors: Array<{ url: string; error: string }> = []
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < urls.length; i += batchSize) {
      if (this.aborted) {
        this.addRemainingUrls(urls, i, bookmarks)
        break
      }

      await this.waitIfPaused()

      const batch = urls.slice(i, Math.min(i + batchSize, urls.length))
      
      try {
        const result = await this.processBatchUrls(batch, options)
        
        result.forEach((bookmark, index) => {
          bookmarks.push(bookmark)
          successCount++
          
          onProgress?.({
            current: Math.min(i + index + 1, urls.length),
            total: urls.length,
            status: `已处理 ${Math.min(i + index + 1, urls.length)} / ${urls.length}`,
            successCount,
            failedCount,
            latestBookmark: bookmark
          })
        })
      } catch (error) {
        this.handleBatchError(batch, error, bookmarks, errors)
        failedCount += batch.length
      }

      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay))
      }
    }

    return { bookmarks, successCount, failedCount, errors }
  }

  /**
   * 批量处理多个 URL
   */
  private async processBatchUrls(urls: string[], options: OrganizeOptions): Promise<EditableBookmark[]> {
    const mode = options.mode || 'tmarks'
    const prompt = mode === 'tmarks' 
      ? buildTMarksBatchPrompt(urls, options)
      : buildNewTabBatchPrompt(urls, options)

    const result = await callAI({
      provider: options.provider,
      apiKey: options.apiKey,
      model: options.model,
      apiUrl: options.apiUrl,
      prompt,
      temperature: options.temperature || 0.7,
      maxTokens: 2000
    })

    const parsed = parseBatchAIResponse(result.content)
    return validateAndTransformBatchBookmarks(urls, parsed, options)
  }

  private addRemainingUrls(urls: string[], startIndex: number, bookmarks: EditableBookmark[]) {
    for (let j = startIndex; j < urls.length; j++) {
      bookmarks.push(this.createFallbackBookmark(urls[j]))
    }
  }

  private createFallbackBookmark(url: string): EditableBookmark {
    return {
      url,
      title: url,
      description: '',
      tags: [],
      isSelected: true,
      isSkipped: false
    }
  }

  private handleBatchError(
    batch: string[],
    error: unknown,
    bookmarks: EditableBookmark[],
    errors: Array<{ url: string; error: string }>
  ) {
    batch.forEach(url => {
      errors.push({
        url,
        error: error instanceof Error ? error.message : 'Batch processing failed'
      })
      bookmarks.push(this.createFallbackBookmark(url))
    })
  }

  private async waitIfPaused() {
    while (this.paused && !this.aborted) {
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.VERY_SHORT))
    }
  }

  abort() {
    this.aborted = true
    this.paused = false
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.paused = false
  }

  getStatus() {
    return {
      aborted: this.aborted,
      paused: this.paused
    }
  }
}
