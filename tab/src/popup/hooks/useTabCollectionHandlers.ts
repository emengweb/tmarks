/**
 * Tab Collection 事件处理 Hook
 */

import type { CollectionOption } from '@/components/CollectionOptionsDialog';
import type { BookmarkSiteConfig } from '@/types';
import type { TMarksTabGroup } from '@/lib/api/tab-groups';
import type { TabInfo } from './useTabCollectionState';
import { collectCurrentWindowTabs, closeTabs } from '@/lib/services/tab-collection';
import { createTMarksClient } from '@/lib/api';
import { normalizeApiUrl } from '@/lib/constants/urls';
import { t } from '@/lib/i18n';

interface UseTabCollectionHandlersProps {
  config: BookmarkSiteConfig;
  tabs: TabInfo[];
  selectedTabIds: Set<number>;
  setSelectedTabIds: (ids: Set<number>) => void;
  setIsCollecting: (value: boolean) => void;
  setError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
  setShowCloseConfirm: (show: boolean) => void;
  setCollectedTabIds: (ids: number[]) => void;
  setShowOptionsDialog: (show: boolean) => void;
  groups: TMarksTabGroup[];
  setGroups: (groups: TMarksTabGroup[]) => void;
}

export function useTabCollectionHandlers({
  config,
  tabs,
  selectedTabIds,
  setSelectedTabIds,
  setIsCollecting,
  setError,
  setSuccessMessage,
  setShowCloseConfirm,
  setCollectedTabIds,
  setShowOptionsDialog,
  groups,
  setGroups,
}: UseTabCollectionHandlersProps) {
  const toggleTab = (tabId: number) => {
    const newSelected = new Set(selectedTabIds);
    if (newSelected.has(tabId)) {
      newSelected.delete(tabId);
    } else {
      newSelected.add(tabId);
    }
    setSelectedTabIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedTabIds.size === tabs.length) {
      setSelectedTabIds(new Set());
    } else {
      setSelectedTabIds(new Set(tabs.map((tab) => tab.id)));
    }
  };

  const handleCreateFolder = async (title: string): Promise<TMarksTabGroup> => {
    try {
      const client = createTMarksClient({
        baseUrl: normalizeApiUrl(config.apiUrl),
        apiKey: config.apiKey,
      });
      const response = await client.tabGroups.createFolder(title);
      const newFolder = response.data.tab_group;
      setGroups([...groups, newFolder]);
      return newFolder;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : t('tab_collection_create_folder_failed'));
    }
  };

  const handleQuickCollect = async () => {
    if (selectedTabIds.size === 0) {
      setError(t('tab_collection_select_at_least_one'));
      return;
    }

    setIsCollecting(true);
    setError(null);

    try {
      const result = await collectCurrentWindowTabs(config, selectedTabIds);

      if (result.success) {
        setSuccessMessage(result.message || t('tab_collection_success'));
        setCollectedTabIds(Array.from(selectedTabIds));
        setShowCloseConfirm(true);
      } else {
        setError(result.error || t('tab_collection_failed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tab_collection_failed'));
    } finally {
      setIsCollecting(false);
    }
  };

  const handleShowOptions = () => {
    if (selectedTabIds.size === 0) {
      setError(t('tab_collection_select_at_least_one'));
      return;
    }
    setShowOptionsDialog(true);
  };

  const handleConfirmCollection = async (option: CollectionOption) => {
    setShowOptionsDialog(false);
    setIsCollecting(true);
    setError(null);

    try {
      const result = await collectCurrentWindowTabs(config, selectedTabIds, option);

      if (result.success) {
        setSuccessMessage(result.message || t('tab_collection_success'));
        setCollectedTabIds(Array.from(selectedTabIds));
        setShowCloseConfirm(true);
      } else {
        setError(result.error || t('tab_collection_failed'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tab_collection_failed'));
    } finally {
      setIsCollecting(false);
    }
  };

  const handleCloseTabs = async (collectedTabIds: number[]) => {
    try {
      await closeTabs(collectedTabIds);
      window.close();
    } catch (err) {
      setError(t('tab_collection_close_tabs_failed'));
    }
  };

  const handleKeepTabs = () => {
    setShowCloseConfirm(false);
    setCollectedTabIds([]);
    window.close();
  };

  return {
    toggleTab,
    toggleAll,
    handleCreateFolder,
    handleQuickCollect,
    handleShowOptions,
    handleConfirmCollection,
    handleCloseTabs,
    handleKeepTabs,
  };
}
