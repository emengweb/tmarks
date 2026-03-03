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
   * 逐个处理 URL（顺序处理版本）
   * 
   * 注意：并发版本已注释，因为稳定性问题
   * 如需启用并发，请参考文件末尾的注释代码
   */
  async process(
    urls: string[],
    options: OrganizeOptions,
    onProgress?: (progress: OrganizeProgress) => void
  ): Promise<OrganizeResult> {
    this.aborted = false
    this.paused = false
    
    const batchDelay = options.batchDelay || TIMEOUTS.BATCH_DELAY
    const bookmarks: EditableBookmark[] = []
    const errors: Array<{ url: string; error: string }> = []
    let successCount = 0
    let failedCount = 0

    // 顺序处理每个 URL
    for (let i = 0; i < urls.length; i++) {
      if (this.aborted) {
        this.addRemainingUrls(urls, i, bookmarks)
        break
      }

      await this.waitIfPaused()

      const url = urls[i]
      
      // 开始处理前更新进度
      onProgress?.({
        current: i,
        total: urls.length,
        status: `正在处理 ${i + 1}/${urls.length} - 发送请求...`,
        successCount,
        failedCount
      })
      
      try {
        // 显示等待响应状态
        onProgress?.({
          current: i,
          total: urls.length,
          status: `正在处理 ${i + 1}/${urls.length} - 等待 AI 响应...`,
          successCount,
          failedCount
        })
        
        const bookmark = await this.processUrl(url, options)
        bookmarks.push(bookmark)
        successCount++
        
        // 完成后更新进度
        onProgress?.({
          current: i + 1,
          total: urls.length,
          status: `已处理 ${i + 1}/${urls.length}`,
          successCount,
          failedCount,
          latestBookmark: bookmark
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ url, error: errorMessage })
        const failedBookmark = this.createFallbackBookmark(url)
        bookmarks.push(failedBookmark)
        failedCount++
        
        onProgress?.({
          current: i + 1,
          total: urls.length,
          status: `已处理 ${i + 1}/${urls.length}`,
          successCount,
          failedCount,
          latestBookmark: failedBookmark
        })
      }

      // 延迟（除了最后一个）
      if (i < urls.length - 1) {
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


/*
 * ============================================================================
 * 并发版本的逐个处理代码（已禁用，保留供将来使用）
 * ============================================================================
 * 
 * 由于稳定性问题，并发功能已被禁用。
 * 如需重新启用，请将下面的代码替换到 process 方法中，
 * 并恢复 handleBatchResults 方法。
 * 
 * 并发逻辑说明：
 * - 将 URLs 分组，每组 concurrency 个
 * - 使用 Promise.allSettled 同时处理一组中的所有 URL
 * - 每个 URL 单独调用一次 AI
 * 
 * ============================================================================

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
      const batchNumber = Math.floor(i / concurrency) + 1
      const totalBatches = Math.ceil(urls.length / concurrency)
      
      onProgress?.({
        current: i,
        total: urls.length,
        status: `第 ${batchNumber}/${totalBatches} 组 - 发送 ${batch.length} 个并发请求...`,
        successCount,
        failedCount
      })
      
      onProgress?.({
        current: i,
        total: urls.length,
        status: `第 ${batchNumber}/${totalBatches} 组 - 等待 AI 响应中（${batch.length} 个并发）...`,
        successCount,
        failedCount
      })
      
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
        batchNumber,
        totalBatches,
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

  private handleBatchResults(
    results: PromiseSettledResult<EditableBookmark>[],
    batch: string[],
    bookmarks: EditableBookmark[],
    errors: Array<{ url: string; error: string }>,
    currentIndex: number,
    totalUrls: number,
    successCount: number,
    failedCount: number,
    batchNumber: number,
    totalBatches: number,
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
            : `第 ${batchNumber}/${totalBatches} 组 - 已处理 ${current} / ${totalUrls}`,
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
            : `第 ${batchNumber}/${totalBatches} 组 - 已处理 ${current} / ${totalUrls}`,
          successCount,
          failedCount: failedCount + index + 1,
          latestBookmark: failedBookmark
        })
      }
    })
  }

 * ============================================================================
 */
