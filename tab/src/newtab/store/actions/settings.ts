/**
 * 设置操作 Actions
 */

import type { NewTabSettings } from '../../types/storage'
import type { NewTabState } from '../types'
import { logger } from '@/lib/utils/logger'

export interface SettingsActions {
  updateSettings: (updates: Partial<NewTabSettings>) => void
}

export function createSettingsActions(
  get: () => NewTabState,
  set: (partial: Partial<NewTabState>) => void
): SettingsActions {
  return {
    updateSettings: (updates: Partial<NewTabSettings>) => {
      const state = get()
      const newSettings = { ...state.settings, ...updates }
      
      set({ settings: newSettings })
      state.saveData()
      
      logger.info('[Settings] Updated settings:', Object.keys(updates))
    },
  }
}
