/**
 * Tab Collection 状态管理 Hook
 */

import { useState, useEffect } from 'react';
import { getCurrentWindowTabs } from '@/lib/services/tab-collection';
import { createTMarksClient } from '@/lib/api';
import { normalizeApiUrl } from '@/lib/constants/urls';
import { t } from '@/lib/i18n';
import { logger } from '@/lib/utils/logger';
import type { BookmarkSiteConfig } from '@/types';
import type { TMarksTabGroup } from '@/lib/api/tab-groups';

export interface TabInfo {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

export function useTabCollectionState(config: BookmarkSiteConfig) {
  const [tabs, setTabs] = useState<TabInfo[]>([]);
  const [selectedTabIds, setSelectedTabIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isCollecting, setIsCollecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [collectedTabIds, setCollectedTabIds] = useState<number[]>([]);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);
  const [groups, setGroups] = useState<TMarksTabGroup[]>([]);

  const loadTabs = async () => {
    try {
      setIsLoading(true);
      const allTabs = await getCurrentWindowTabs();

      // Filter out chrome:// and extension pages
      const validTabs = allTabs
        .filter((tab) => tab.id && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'))
        .map((tab) => ({
          id: tab.id!,
          title: tab.title || 'Untitled',
          url: tab.url!,
          favIconUrl: tab.favIconUrl,
        }));

      setTabs(validTabs);
      setSelectedTabIds(new Set(validTabs.map((tab) => tab.id)));
    } catch (err) {
      setError(t('tab_collection_load_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const client = createTMarksClient({
        baseUrl: normalizeApiUrl(config.apiUrl),
        apiKey: config.apiKey,
      });
      const allGroups = await client.tabGroups.getAllTabGroups();
      setGroups(allGroups);
    } catch (err) {
      logger.error(t('tab_collection_load_groups_failed'), err);
      setGroups([]);
    }
  };

  useEffect(() => {
    loadTabs();
    loadGroups();
  }, []);

  return {
    tabs,
    selectedTabIds,
    setSelectedTabIds,
    isLoading,
    isCollecting,
    setIsCollecting,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    showCloseConfirm,
    setShowCloseConfirm,
    collectedTabIds,
    setCollectedTabIds,
    showOptionsDialog,
    setShowOptionsDialog,
    groups,
    setGroups,
    loadTabs,
  };
}
