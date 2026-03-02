/**
 * Page 相关 actions
 */

import type { PageInfo, Message } from '@/types';
import { t } from '@/lib/i18n';

export interface PageActions {
  currentPage: PageInfo | null;
  setCurrentPage: (page: PageInfo | null) => void;
  extractPageInfo: () => Promise<void>;
}

export const createPageActions = (set: any): PageActions => ({
  currentPage: null,
  setCurrentPage: (page) => set({ currentPage: page }),

  extractPageInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chrome.runtime.sendMessage<Message, any>({
        type: 'EXTRACT_PAGE_INFO',
      });
      // Background returns { success: true, data: pageInfo }
      const pageInfo = response?.data || response;
      set({ currentPage: pageInfo, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : t('error_extract_failed'),
        isLoading: false,
      });
    }
  },
});
