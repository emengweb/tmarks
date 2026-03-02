/**
 * NewTab 特定数据加载 Hook
 */

import { useState, useEffect } from 'react'
import { StorageService } from '@/lib/utils/storage'
import { logger } from '@/lib/utils/logger'

export function useNewTabData() {
  const [existingFolders, setExistingFolders] = useState<string[]>([])

  useEffect(() => {
    async function loadExistingFolders() {
      try {
        const config = await StorageService.loadConfig()
        const maxGroups = config.aiConfig.maxImportGroups || 7
        
        const result = await chrome.storage.local.get('newtab_groups')
        if (result.newtab_groups && Array.isArray(result.newtab_groups)) {
          const folders = result.newtab_groups
            .filter((g: any) => g.id !== 'home')
            .map((g: any) => g.name)
            .slice(0, maxGroups)
          setExistingFolders(folders)
        }
      } catch (error) {
        logger.error('Failed to load existing folders', error)
      }
    }
    loadExistingFolders()
  }, [])

  return { existingFolders }
}
