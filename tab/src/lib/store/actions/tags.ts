/**
 * Tags 相关 actions
 */

import type { TagSuggestion } from '@/types';

export interface TagActions {
  recommendedTags: TagSuggestion[];
  existingTags: Array<{ id: string; name: string; color: string; count: number }>;
  selectedTags: string[];
  setRecommendedTags: (tags: TagSuggestion[]) => void;
  setExistingTags: (tags: Array<{ id: string; name: string; color: string; count: number }>) => void;
  toggleTag: (tagName: string) => void;
  addCustomTag: (tagName: string) => void;
  clearSelectedTags: () => void;
  loadExistingTags: () => Promise<void>;
}

export const createTagActions = (set: any, get: any): TagActions => ({
  recommendedTags: [],
  existingTags: [],
  selectedTags: [],

  setRecommendedTags: (tags) => set({ recommendedTags: tags }),
  setExistingTags: (tags) => set({ existingTags: tags }),
  clearSelectedTags: () => set({ selectedTags: [] }),

  toggleTag: (tagName) => {
    const { selectedTags } = get();
    if (selectedTags.includes(tagName)) {
      set({ selectedTags: selectedTags.filter((t: string) => t !== tagName) });
    } else {
      set({ selectedTags: [...selectedTags, tagName] });
    }
  },

  addCustomTag: (tagName) => {
    const { selectedTags, recommendedTags } = get();
    if (!selectedTags.includes(tagName)) {
      set({ selectedTags: [...selectedTags, tagName] });
    }
    if (!recommendedTags.find((t: TagSuggestion) => t.name === tagName)) {
      set({
        recommendedTags: [
          ...recommendedTags,
          { name: tagName, isNew: true, confidence: 1 },
        ],
      });
    }
  },

  loadExistingTags: async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_EXISTING_TAGS'
      });
      // Background script returns { success: true, data: tags }
      const tags = response?.data || response;
      set({ existingTags: Array.isArray(tags) ? tags : [] });
    } catch (err) {
      console.error('Failed to load existing tags:', err);
      set({ existingTags: [] });
    }
  },
});
