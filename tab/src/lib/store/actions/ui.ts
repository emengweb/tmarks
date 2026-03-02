/**
 * UI 状态相关 actions
 */

import type { RecommendationResult } from '@/types';

export interface UIActions {
  isLoading: boolean;
  isSaving: boolean;
  isRecommending: boolean;
  error: string | null;
  successMessage: string | null;
  loadingMessage: string | null;
  lastRecommendationSource: RecommendationResult['source'] | null;
  lastRecommendationMessage: string | null;
  lastSaveDurationMs: number | null;
  lastRecommendationDurationMs: number | null;
  includeThumbnail: boolean;
  createSnapshot: boolean;
  isPublic: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setLoadingMessage: (message: string | null) => void;
  setIncludeThumbnail: (value: boolean) => void;
  setCreateSnapshot: (value: boolean) => void;
  setIsPublic: (value: boolean) => void;
}

export const createUIActions = (set: any): UIActions => ({
  isLoading: false,
  isSaving: false,
  isRecommending: false,
  error: null,
  successMessage: null,
  loadingMessage: null,
  lastRecommendationSource: null,
  lastRecommendationMessage: null,
  lastSaveDurationMs: null,
  lastRecommendationDurationMs: null,
  includeThumbnail: false,
  createSnapshot: false,
  isPublic: false,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSuccessMessage: (message) => set({ successMessage: message }),
  setLoadingMessage: (message) => set({ loadingMessage: message }),
  setIncludeThumbnail: (value) => set({ includeThumbnail: value }),
  setCreateSnapshot: (value) => set({ createSnapshot: value }),
  setIsPublic: (value) => set({ isPublic: value }),
});
