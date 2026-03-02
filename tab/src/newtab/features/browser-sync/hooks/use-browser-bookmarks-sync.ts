/**
 * 浏览器书签同步 Hook
 */

import { useEffect, useRef } from 'react';
import { useNewtabStore } from '../../../hooks';
import { hasBookmarksApi, getChildren, getSubTree, getBookmarkNode } from '../api';
import { ensureRootFolder } from '../root-folder';
import { ensureHomeFolder } from '../home-folder';
import { autoDiscoverAndCreateGroups } from '../auto-discover';
import type { ExtendedBookmarkTreeNode } from '../types';
import { toGridItems } from '../transform';
import { registerBookmarkListeners } from '../listeners';
import type { Item } from '../../../types/core';

export function useBrowserBookmarksSync() {
  const {
    isLoading,
    ensureGroupBookmarkFolderId,
    removeGroup,
    setBrowserBookmarksRootId,
    setHomeBrowserFolderId,
    setIsApplyingBrowserBookmarks,
    replaceBrowserBookmarkItems,
    upsertBrowserBookmarkNode,
    removeBrowserBookmarkById,
    applyBrowserBookmarkChildrenOrder,
  } = useNewtabStore();

  const refreshInFlight = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!hasBookmarksApi()) return;

    let disposed = false;

    const isInScopeParent = (parentId?: string) => {
      const state = useNewtabStore.getState();
      const rootId = state.browserBookmarksRootId;
      const homeId = state.homeBrowserFolderId;
      if (!rootId || !parentId) return false;
      if (parentId === rootId || parentId === homeId) return true;
      if (state.groups.some((g) => g.bookmarkFolderId === parentId)) return true;
      // 检查分组项目和首页项目
      return state.items.some((i) => i.browserBookmarkId === parentId && i.type === 'folder') ||
             state.homeItems.some((i) => i.browserBookmarkId === parentId && i.type === 'folder');
    };

    const refreshChildrenOrder = async (parentBookmarkId: string) => {
      try {
        const children = await getChildren(parentBookmarkId);
        const ordered = children.map((c) => c.id);
        setIsApplyingBrowserBookmarks(true);
        applyBrowserBookmarkChildrenOrder(parentBookmarkId, ordered);
      } finally {
        setIsApplyingBrowserBookmarks(false);
      }
    };

    const purgeBrowserLinkedItems = () => {
      const snapshot = useNewtabStore.getState();
      const filteredItems = snapshot.items.filter((item) => !item.browserBookmarkId);
      const filteredHomeItems = snapshot.homeItems.filter((item) => !item.browserBookmarkId);
      const nextCurrentFolderId =
        snapshot.currentFolderId && 
        (filteredItems.some((item) => item.id === snapshot.currentFolderId) ||
         filteredHomeItems.some((item) => item.id === snapshot.currentFolderId))
          ? snapshot.currentFolderId
          : null;
      useNewtabStore.setState({ 
        items: filteredItems, 
        homeItems: filteredHomeItems,
        currentFolderId: nextCurrentFolderId 
      });
      snapshot.saveData();
    };

    const resetBrowserLinkedState = () => {
      const snapshot = useNewtabStore.getState();
      // 删除所有分组
      snapshot.groups.forEach((g) => removeGroup(g.id));
      purgeBrowserLinkedItems();
      setBrowserBookmarksRootId(null);
      setHomeBrowserFolderId(null);
    };

    const refreshFromBrowser = async () => {
      if (refreshInFlight.current) return;
      refreshInFlight.current = true;

      try {
        const result = await ensureRootFolder();
        if (!result || disposed) return;

        const { id: rootId, wasRecreated } = result;
        if (wasRecreated) resetBrowserLinkedState();

        setBrowserBookmarksRootId(rootId);

        const homeFolder = await ensureHomeFolder(rootId);
        if (homeFolder) setHomeBrowserFolderId(homeFolder.id);

        const state = useNewtabStore.getState();
        await autoDiscoverAndCreateGroups(
          rootId,
          state.addGroup,
          state.setGroupBookmarkFolderId,
          () => useNewtabStore.getState().groups
        );

        if (wasRecreated) {
          window.dispatchEvent(
            new CustomEvent('tmarks-folder-recreated', {
              detail: { message: 'TMarks 书签文件夹已重建' },
            })
          );
        }

        const configuredGroups = useNewtabStore.getState().groups.map((g) => g.id);
        const collected: Item[] = [];
        const collectedHome: Item[] = [];
        const refreshedGroups: string[] = [];

        // 首先处理首页
        if (homeFolder) {
          const subTree = await getSubTree(homeFolder.id);
          if (subTree) {
            collectedHome.push(...toGridItems(subTree.children || [], { groupId: '__home__', parentGridId: null }));
          }
        }

        // 然后处理分组
        for (const groupId of configuredGroups) {
          const folderId = await ensureGroupBookmarkFolderId(groupId);
          if (!folderId) continue;

          refreshedGroups.push(groupId);
          const subTree = await getSubTree(folderId);
          if (subTree) {
            collected.push(...toGridItems(subTree.children || [], { groupId, parentGridId: null }));
          }
        }

        setIsApplyingBrowserBookmarks(true);
        // 更新首页项目
        if (collectedHome.length > 0) {
          useNewtabStore.setState({ homeItems: collectedHome });
        }
        // 更新分组项目
        replaceBrowserBookmarkItems(collected, { groupIds: refreshedGroups });
      } finally {
        setIsApplyingBrowserBookmarks(false);
        refreshInFlight.current = false;
      }
    };

    refreshFromBrowser();

    const cleanup = registerBookmarkListeners({
      onCreated: (id, node) => {
        const now = Date.now();
        if (now < useNewtabStore.getState().browserBookmarkWriteLockUntil) return;
        if (!isInScopeParent(node.parentId)) return;

        setIsApplyingBrowserBookmarks(true);
        try {
          upsertBrowserBookmarkNode({
            id,
            parentId: node.parentId,
            title: node.title,
            url: node.url,
            index: node.index,
          });
        } finally {
          setIsApplyingBrowserBookmarks(false);
        }
        if (node.parentId) refreshChildrenOrder(node.parentId);
      },

      onRemoved: (id, removeInfo) => {
        const now = Date.now();
        if (now < useNewtabStore.getState().browserBookmarkWriteLockUntil) return;

        const state = useNewtabStore.getState();
        if (state.browserBookmarksRootId && id === state.browserBookmarksRootId) {
          resetBrowserLinkedState();
          refreshFromBrowser();
          return;
        }

        if (!isInScopeParent(removeInfo?.parentId)) return;

        const matchingGroup = state.groups.find((g) => g.bookmarkFolderId === id);
        if (matchingGroup) {
          removeGroup(matchingGroup.id);
        }

        setIsApplyingBrowserBookmarks(true);
        try {
          removeBrowserBookmarkById(id);
        } finally {
          setIsApplyingBrowserBookmarks(false);
        }
        if (removeInfo?.parentId) refreshChildrenOrder(removeInfo.parentId);
      },

      onChanged: async (id, changeInfo) => {
        const now = Date.now();
        if (now < useNewtabStore.getState().browserBookmarkWriteLockUntil) return;

        const node = await getBookmarkNode(id);
        if (!node || !isInScopeParent((node as ExtendedBookmarkTreeNode).parentId)) return;

        setIsApplyingBrowserBookmarks(true);
        try {
          upsertBrowserBookmarkNode({
            id,
            parentId: (node as ExtendedBookmarkTreeNode).parentId,
            title: changeInfo.title ?? node.title,
            url: changeInfo.url ?? node.url,
            index: (node as ExtendedBookmarkTreeNode).index,
          });
        } finally {
          setIsApplyingBrowserBookmarks(false);
        }
      },

      onMoved: async (id, moveInfo) => {
        const now = Date.now();
        if (now < useNewtabStore.getState().browserBookmarkWriteLockUntil) return;

        const inNew = isInScopeParent(moveInfo.parentId);
        const inOld = isInScopeParent(moveInfo.oldParentId);
        if (!inNew && !inOld) return;

        if (inOld && !inNew) {
          setIsApplyingBrowserBookmarks(true);
          try {
            removeBrowserBookmarkById(id);
          } finally {
            setIsApplyingBrowserBookmarks(false);
          }
          await refreshChildrenOrder(moveInfo.oldParentId);
          return;
        }

        const node = await getBookmarkNode(id);
        if (node && inNew) {
          setIsApplyingBrowserBookmarks(true);
          try {
            upsertBrowserBookmarkNode({
              id,
              parentId: moveInfo.parentId,
              title: node.title,
              url: node.url,
              index: moveInfo.index,
            });
          } finally {
            setIsApplyingBrowserBookmarks(false);
          }
        }

        if (inOld) await refreshChildrenOrder(moveInfo.oldParentId);
        if (inNew) await refreshChildrenOrder(moveInfo.parentId);
      },

      onChildrenReordered: (id) => {
        const now = Date.now();
        if (now < useNewtabStore.getState().browserBookmarkWriteLockUntil) return;
        if (!isInScopeParent(id)) return;
        refreshChildrenOrder(id);
      },
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [isLoading]);
}
