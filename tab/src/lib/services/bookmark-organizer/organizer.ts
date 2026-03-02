/**
 * 书签整理器核心类 - 重构版
 * 职责：协调各个处理器，提供统一的接口
 */

import type { OrganizeOptions, SuggestedGroup, OrganizeProgress, OrganizeResult } from './types'
import { SingleUrlProcessor } from './processors/single-processor'
import { BatchUrlProcessor } from './processors/batch-processor'
import { GroupSuggester } from './group-suggester'

export class BookmarkOrganizer {
  private singleProcessor = new SingleUrlProcessor()
  private batchProcessor = new BatchUrlProcessor()
  private groupSuggester = new GroupSuggester()

  /**
   * 推荐分组（NewTab 模式专用）
   */
  async suggestGroups(urls: string[], options: OrganizeOptions): Promise<SuggestedGroup[]> {
    return this.groupSuggester.suggestGroups(urls, options)
  }

  /**
   * 批量整理 URL
   */
  async organizeUrls(
    urls: string[],
    options: OrganizeOptions,
    onProgress?: (progress: OrganizeProgress) => void
  ): Promise<OrganizeResult> {
    const batchMode = options.batchMode || 'single'
    
    if (batchMode === 'batch') {
      return this.batchProcessor.process(urls, options, onProgress)
    } else {
      return this.singleProcessor.process(urls, options, onProgress)
    }
  }

  abort() {
    this.singleProcessor.abort()
    this.batchProcessor.abort()
  }

  pause() {
    this.singleProcessor.pause()
    this.batchProcessor.pause()
  }

  resume() {
    this.singleProcessor.resume()
    this.batchProcessor.resume()
  }

  getStatus() {
    // 返回当前活跃处理器的状态
    const singleStatus = this.singleProcessor.getStatus()
    const batchStatus = this.batchProcessor.getStatus()
    
    return {
      aborted: singleStatus.aborted || batchStatus.aborted,
      paused: singleStatus.paused || batchStatus.paused
    }
  }
}
