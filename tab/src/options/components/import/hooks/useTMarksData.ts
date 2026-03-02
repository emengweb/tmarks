/**
 * TMarks 特定数据加载 Hook
 */

import { useState, useEffect } from 'react'
import { StorageService } from '@/lib/utils/storage'
import { logger } from '@/lib/utils/logger'

export function useTMarksData() {
  const [existingTags, setExistingTags] = useState<string[]>([])

  useEffect(() => {
    async function loadExistingTags() {
      try {
        const config = await StorageService.loadConfig()
        if (!config.bookmarkSite.apiUrl || !config.bookmarkSite.apiKey) {
          return
        }

        const { TMarks } = await import('@/lib/api')
        const api = new TMarks({
          apiKey: config.bookmarkSite.apiKey,
          baseUrl: config.bookmarkSite.apiUrl
        })

        const response = await api.tags.getTags()
        const tags = response.data.tags.map(t => t.name)
        setExistingTags(tags)
      } catch (error) {
        logger.error('Failed to load existing tags', error)
      }
    }
    loadExistingTags()
  }, [])

  return { existingTags }
}
