/**
 * AI 推荐相关 actions
 */

import type { Message } from '@/types';
import { t } from '@/lib/i18n';

export interface RecommendActions {
  recommendTags: () => Promise<void>;
}

export const createRecommendActions = (set: any, get: any): RecommendActions => ({
  recommendTags: async () => {
    const { currentPage } = get();

    if (!currentPage) {
      set({ error: t('error_no_page_info') });
      return;
    }

    const startTime = Date.now();

    try {
      set({
        isLoading: true,
        isRecommending: true,
        error: null,
        lastRecommendationSource: null,
        lastRecommendationMessage: null,
        lastRecommendationDurationMs: null
      });

      const response = await chrome.runtime.sendMessage<Message, any>({
        type: 'RECOMMEND_TAGS',
        payload: currentPage
      });

      // Background returns { success: true, data: result }
      const result = response?.data || response;

      const endTime = Date.now();
      const elapsedMs = endTime - startTime;

      // Auto-select all recommended tags
      const autoSelectedTags = Array.isArray(result?.tags) ? result.tags.map((t: any) => t.name) : [];

      const baseState = {
        recommendedTags: Array.isArray(result?.tags) ? result.tags : [],
        selectedTags: autoSelectedTags,
        isLoading: false,
        isRecommending: false,
        lastRecommendationSource: result?.source || 'unknown',
        lastRecommendationMessage: result?.message || null,
        lastRecommendationDurationMs: elapsedMs
      };

      if (result?.source === 'fallback') {
        set({
          ...baseState,
          error: result.message
            ? t('error_ai_recommend_fallback_with_msg', result.message)
            : t('error_ai_recommend_fallback')
        });
      } else {
        set({
          ...baseState,
          error: null
        });

        const aiMessage = t('msg_ai_recommend_complete', (elapsedMs / 1000).toFixed(2));
        set({ successMessage: aiMessage });
        setTimeout(() => {
          if (get().successMessage === aiMessage) {
            set({ successMessage: null });
          }
        }, 2000);
      }
    } catch (error) {
      const elapsedMs = Date.now() - startTime;
      set({
        error: error instanceof Error ? error.message : t('error_recommend_tags'),
        isLoading: false,
        isRecommending: false,
        lastRecommendationSource: null,
        lastRecommendationMessage: null,
        lastRecommendationDurationMs: elapsedMs
      });
    }
  },
});
