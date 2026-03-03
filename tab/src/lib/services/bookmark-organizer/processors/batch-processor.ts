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
   * 批量处理 URL（顺序处理版本）
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
    
    const batchSize = options.batchSize || 5
    const batchDelay = options.batchDelay || TIMEOUTS.BATCH_DELAY
    const bookmarks: EditableBookmark[] = []
    const errors: Array<{ url: string; error: string }> = []
    let successCount = 0
    let failedCount = 0

    // 顺序处理每批
    for (let i = 0; i < urls.length; i += batchSize) {
      if (this.aborted) {
        // 添加剩余的 URLs
        for (let j = i; j < urls.length; j++) {
          bookmarks.push(this.createFallbackBookmark(urls[j]))
        }
        break
      }

      await this.waitIfPaused()

      const batch = urls.slice(i, Math.min(i + batchSize, urls.length))
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(urls.length / batchSize)
      
      // 批次开始前更新进度
      onProgress?.({
        current: i,
        total: urls.length,
        status: `第 ${batchNumber}/${totalBatches} 批 - 发送 ${batch.length} 个 URL 到 AI...`,
        successCount,
        failedCount
      })
      
      try {
        // 显示等待响应状态
        onProgress?.({
          current: i,
          total: urls.length,
          status: `第 ${batchNumber}/${totalBatches} 批 - 等待 AI 响应中...`,
          successCount,
          failedCount
        })
        
        const result = await this.processBatchUrls(batch, options)
        
        // 批量添加书签
        result.forEach(bookmark => {
          bookmarks.push(bookmark)
          successCount++
        })
        
        // 批次完成后统一更新进度
        onProgress?.({
          current: Math.min(i + batch.length, urls.length),
          total: urls.length,
          status: `第 ${batchNumber}/${totalBatches} 批完成 ✓ 已处理 ${Math.min(i + batch.length, urls.length)} / ${urls.length}`,
          successCount,
          failedCount,
          latestBookmark: result[result.length - 1]
        })
      } catch (error) {
        this.handleBatchError(batch, error, bookmarks, errors)
        failedCount += batch.length
        
        // 批次失败后更新进度
        onProgress?.({
          current: Math.min(i + batch.length, urls.length),
          total: urls.length,
          status: `第 ${batchNumber}/${totalBatches} 批失败 - 已处理 ${Math.min(i + batch.length, urls.length)} / ${urls.length}`,
          successCount,
          failedCount
        })
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


/*
 * ============================================================================
 * 并发版本的批量处理代码（已禁用，保留供将来使用）
 * ============================================================================
 * 
 * 由于稳定性问题，并发功能已被禁用。
 * 如需重新启用，请将下面的代码替换到 process 方法中。
 * 
 * 并发逻辑说明：
 * - 将所有 URLs 分成多个批次（每批 batchSize 个）
 * - 同时处理 concurrency 个批次
 * - 使用 Promise.allSettled 实现真正的并发
 * 
 * 示例：65 个 URL，每批 5 个，20 个并发
 * - 总共 13 个批次
 * - 第 1 轮：同时处理批次 0-19（20 个并发）
 * - 第 2 轮：同时处理批次 20-39（20 个并发）
 * - ...
 * 
 * ============================================================================

  async process(
    urls: string[],
    options: OrganizeOptions,
    onProgress?: (progress: OrganizeProgress) => void
  ): Promise<OrganizeResult> {
    this.aborted = false
    this.paused = false
    
    const batchSize = options.batchSize || 5
    const concurrency = options.concurrency || 1
    const batchDelay = options.batchDelay || TIMEOUTS.BATCH_DELAY
    const bookmarks: EditableBookmark[] = []
    const errors: Array<{ url: string; error: string }> = []
    let successCount = 0
    let failedCount = 0

    // 将 URLs 分成批次
    const batches: string[][] = []
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, Math.min(i + batchSize, urls.length)))
    }

    // 并发处理批次
    for (let i = 0; i < batches.length; i += concurrency) {
      if (this.aborted) {
        // 添加剩余的 URLs
        for (let j = i; j < batches.length; j++) {
          batches[j].forEach(url => bookmarks.push(this.createFallbackBookmark(url)))
        }
        break
      }

      await this.waitIfPaused()

      const concurrentBatches = batches.slice(i, Math.min(i + concurrency, batches.length))
      const groupNumber = Math.floor(i / concurrency) + 1
      const totalGroups = Math.ceil(batches.length / concurrency)
      
      // 计算当前已处理的 URL 数量
      let processedUrlCount = 0
      for (let j = 0; j < i; j++) {
        processedUrlCount += batches[j].length
      }
      
      // 批次组开始前更新进度
      onProgress?.({
        current: processedUrlCount,
        total: urls.length,
        status: `第 ${groupNumber}/${totalGroups} 组 - 发送 ${concurrentBatches.length} 个批次（${concurrency} 个并发）...`,
        successCount,
        failedCount
      })
      
      // 显示等待响应状态
      onProgress?.({
        current: processedUrlCount,
        total: urls.length,
        status: `第 ${groupNumber}/${totalGroups} 组 - 等待 AI 响应中（${concurrentBatches.length} 个批次并发）...`,
        successCount,
        failedCount
      })
      
      try {
        const batchPromises = concurrentBatches.map(batch => this.processBatchUrls(batch, options))
        const results = await Promise.allSettled(batchPromises)
        
        results.forEach((result, idx) => {
          const batch = concurrentBatches[idx]
          if (result.status === 'fulfilled') {
            result.value.forEach(bookmark => {
              bookmarks.push(bookmark)
              successCount++
            })
          } else {
            this.handleBatchError(batch, result.reason, bookmarks, errors)
            failedCount += batch.length
          }
        })
        
        // 计算已处理的 URL 总数
        const currentProcessedCount = processedUrlCount + concurrentBatches.reduce((sum, b) => sum + b.length, 0)
        
        // 批次组完成后更新进度
        onProgress?.({
          current: Math.min(currentProcessedCount, urls.length),
          total: urls.length,
          status: `第 ${groupNumber}/${totalGroups} 组完成 ✓ 已处理 ${Math.min(currentProcessedCount, urls.length)} / ${urls.length}`,
          successCount,
          failedCount,
          latestBookmark: bookmarks[bookmarks.length - 1]
        })
      } catch (error) {
        concurrentBatches.forEach(batch => {
          this.handleBatchError(batch, error, bookmarks, errors)
          failedCount += batch.length
        })
      }

      if (i + concurrency < batches.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay))
      }
    }

    return { bookmarks, successCount, failedCount, errors }
  }

 * ============================================================================
 */
