/**
 * 全局状态管理 Store
 */

import { create } from 'zustand';
import { createUIActions, type UIActions } from './actions/ui';
import { createPageActions, type PageActions } from './actions/page';
import { createTagActions, type TagActions } from './actions/tags';
import { createConfigActions, type ConfigActions } from './actions/config';
import { createBookmarkActions, type BookmarkActions } from './actions/bookmark';
import { createRecommendActions, type RecommendActions } from './actions/recommend';

interface AppState extends
  UIActions,
  PageActions,
  TagActions,
  ConfigActions,
  BookmarkActions,
  RecommendActions {
  setCurrentPage: (page: any) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  ...createUIActions(set),
  ...createPageActions(set),
  ...createTagActions(set, get),
  ...createConfigActions(set),
  ...createBookmarkActions(set, get),
  ...createRecommendActions(set, get),

  setCurrentPage: (page) =>
    set((state) => {
      let includeThumbnail = false;
      const defaultIncludeThumbnail = state.config?.preferences.defaultIncludeThumbnail ?? true;
      const defaultIsPublic = state.config?.preferences.defaultIsPublic ?? true;
      const isSamePage = state.currentPage && page && state.currentPage.url === page.url;

      if (page) {
        if (isSamePage) {
          includeThumbnail = state.includeThumbnail && Boolean(page.thumbnail);
        } else {
          includeThumbnail = defaultIncludeThumbnail && Boolean(page.thumbnail);
        }
      }

      return {
        currentPage: page,
        includeThumbnail,
        isPublic: isSamePage ? state.isPublic : defaultIsPublic
      };
    }),
}));
