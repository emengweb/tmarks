/**
 * 单个 URL 处理器
 */

import { callAI } from '../../ai-client'
import type { EditableBookmark } from '@/options/components/import/EditableBookmarkTable'
import { TIMEOUTS } from '../../../constants/timeouts'
import type { OrganizeOptions, OrganizeProgress, OrganizeResult } from '../types'
import { buildTMarksPrompt, buildNewTabPrompt } from '../prompts'
import { parseAIResponse } from '../parsers'
import { validateAndTransformBookmark } from './validators'

export class SingleUrlProcessor {
  private aborted = false
  private paused = false

  /**
   * 逐个处理 URL
   */
  async process(
    urls: string[],
    options: OrganizeOptions,
    onProgress?: (progress: OrganizeProgress) => void
  ): Promise<OrganizeResult> {
    this.aborted = false
    this.paused = false
    
    const concurrency = options.concurrency || 3
    const batchDelay = options.batchDelay || TIMEOUTS.BATCH_DELAY
    const bookmarks: EditableBookmark[] = []
    const errors: Array<{ url: string; error: string }> = []
    let successCount = 0
    let failedCount = 0

    for (let i = 0; i < urls.length; i += concurrency) {
      if (this.aborted) {
        this.addRemainingUrls(urls, i, bookmarks)
        break
      }

      await this.waitIfPaused()

      const batch = urls.slice(i, Math.min(i + concurrency, urls.length))
      const batchPromises = batch.map(url => this.processUrl(url, options))
      const results = await Promise.allSettled(batchPromises)

      this.handleBatchResults(
        results,
        batch,
        bookmarks,
        errors,
        i,
        urls.length,
        successCount,
        failedCount,
        onProgress
      )

      successCount += results.filter(r => r.status === 'fulfilled').length
      failedCount += results.filter(r => r.status === 'rejected').length

      if (i + concurrency < urls.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay))
      }
    }

    return { bookmarks, successCount, failedCount, errors }
  }

  /**
   * 处理单个 URL
   */
  private async processUrl(url: string, options: OrganizeOptions): Promise<EditableBookmark> {
    const mode = options.mode || 'tmarks'
    const prompt = mode === 'tmarks' 
      ? buildTMarksPrompt(url, options)
      : buildNewTabPrompt(url, options)

    const result = await callAI({
      provider: options.provider,
      apiKey: options.apiKey,
      model: options.model,
      apiUrl: options.apiUrl,
      prompt,
      temperature: options.temperature || 0.7,
      maxTokens: 500
    })

    const parsed = parseAIResponse(result.content)
    return validateAndTransformBookmark(url, parsed, options)
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

  private async waitIfPaused() {
    while (this.paused && !this.aborted) {
      await new Promise(resolve => setTimeout(resolve, TIMEOUTS.VERY_SHORT))
    }
  }

  private handleBatchResults(
    results: PromiseSettledResult<EditableBookmark>[],
    batch: string[],
    bookmarks: EditableBookmark[],
    errors: Array<{ url: string; error: string }>,
    currentIndex: number,
    totalUrls: number,
    successCount: number,
    failedCount: number,
    onProgress?: (progress: OrganizeProgress) => void
  ) {
    results.forEach((result, index) => {
      const url = batch[index]
      const current = Math.min(currentIndex + index + 1, totalUrls)
      
      if (result.status === 'fulfilled') {
        bookmarks.push(result.value)
        onProgress?.({
          current,
          total: totalUrls,
          status: this.paused 
            ? `已暂停 - 已处理 ${current} / ${totalUrls}`
            : `已处理 ${current} / ${totalUrls}`,
          successCount: successCount + index + 1,
          failedCount,
          latestBookmark: result.value
        })
      } else {
        const errorMessage = result.reason?.message || result.reason?.toString() || 'Unknown error'
        errors.push({ url, error: errorMessage })
        const failedBookmark = this.createFallbackBookmark(url)
        bookmarks.push(failedBookmark)
        
        onProgress?.({
          current,
          total: totalUrls,
          status: this.paused 
            ? `已暂停 - 已处理 ${current} / ${totalUrls}`
            : `已处理 ${current} / ${totalUrls}`,
          successCount,
          failedCount: failedCount + index + 1,
          latestBookmark: failedBookmark
        })
      }
    })
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
