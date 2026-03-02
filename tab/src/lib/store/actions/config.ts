/**
 * 配置相关 actions
 */

import type { StorageConfig } from '@/types';
import { StorageService } from '@/lib/utils/storage';
import { t } from '@/lib/i18n';

export interface ConfigActions {
  config: StorageConfig | null;
  loadConfig: () => Promise<void>;
  saveConfig: (config: Partial<StorageConfig>) => Promise<void>;
}

export const createConfigActions = (set: any): ConfigActions => ({
  config: null,

  loadConfig: async () => {
    try {
      const config = await StorageService.loadConfig();
      set({
        config,
        createSnapshot: config.preferences.defaultCreateSnapshot ?? false,
        isPublic: config.preferences.defaultIsPublic ?? true
      });
    } catch (error) {
      set({ error: t('error_load_config') });
    }
  },

  saveConfig: async (partialConfig) => {
    try {
      await StorageService.saveConfig(partialConfig);
      const config = await StorageService.loadConfig();
      set({ config });
    } catch (error) {
      set({ error: t('error_save_config') });
    }
  },
});
