/**
 * 合并处理逻辑 Hook
 */

import { useCallback } from 'react';
import type { Item } from '../../../types/core';
import type { MergePrompt } from '../types';

interface UseMergeHandlersProps {
  currentItems: Item[];
  isHomeView: boolean;
  activeGroupId: string | null;
  currentFolderId: string | null;
  currentAddItem: (item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => string;
  currentRemoveItem: (id: string) => void;
  moveHomeItem: (id: string, targetParentId: string | null) => void;
  moveItem: (id: string, targetGroupId: string, targetParentId: string | null) => void;
  reorderHomeItems: (parentId: string | null, fromIndex: number, toIndex: number) => void;
  reorderItems: (groupId: string, parentId: string | null, fromIndex: number, toIndex: number) => void;
}

export function useMergeHandlers({
  currentItems,
  isHomeView,
  activeGroupId,
  currentFolderId,
  currentAddItem,
  currentRemoveItem,
  moveHomeItem,
  moveItem,
  reorderHomeItems,
  reorderItems,
}: UseMergeHandlersProps) {
  const handleMergeFolders = useCallback((folderMergePrompt: MergePrompt | null) => {
    if (!folderMergePrompt) return;
    
    const { sourceId, targetId } = folderMergePrompt;
    const sourceItem = currentItems.find(i => i.id === sourceId);
    const targetItem = currentItems.find(i => i.id === targetId);
    
    if (!sourceItem || !targetItem || sourceItem.type !== 'folder' || targetItem.type !== 'folder') {
      return;
    }
    
    // 将源文件夹的所有子项移动到目标文件夹
    const sourceChildren = currentItems.filter(i => i.parentId === sourceId);
    sourceChildren.forEach(child => {
      if (isHomeView) {
        moveHomeItem(child.id, targetId);
      } else {
        moveItem(child.id, targetItem.groupId, targetId);
      }
    });
    
    // 删除源文件夹
    currentRemoveItem(sourceId);
  }, [currentItems, currentRemoveItem, isHomeView, moveHomeItem, moveItem]);

  const handleCreateFolderFromShortcuts = useCallback((shortcutMergePrompt: MergePrompt | null) => {
    if (!shortcutMergePrompt) return;
    
    const { sourceId, targetId, sourceName, targetName } = shortcutMergePrompt;
    const sourceItem = currentItems.find(i => i.id === sourceId);
    const targetItem = currentItems.find(i => i.id === targetId);
    
    if (!sourceItem || !targetItem) {
      return;
    }
    
    // 创建新文件夹
    const newFolderId = currentAddItem({
      type: 'folder',
      groupId: isHomeView ? '__home__' : (activeGroupId || '__home__'),
      parentId: currentFolderId,
      position: Math.min(sourceItem.position, targetItem.position),
      data: {
        type: 'folder',
        title: `${sourceName} & ${targetName}`,
      },
    });
    
    // 将两个快捷方式移动到新文件夹
    if (isHomeView) {
      moveHomeItem(sourceId, newFolderId);
      moveHomeItem(targetId, newFolderId);
    } else {
      moveItem(sourceId, activeGroupId || '__home__', newFolderId);
      moveItem(targetId, activeGroupId || '__home__', newFolderId);
    }
  }, [currentItems, currentAddItem, isHomeView, activeGroupId, currentFolderId, moveHomeItem, moveItem]);

  const handleReorderShortcuts = useCallback(() => {
    if (isHomeView) {
      reorderHomeItems(currentFolderId, 0, 1);
    } else {
      reorderItems(activeGroupId || '__home__', currentFolderId, 0, 1);
    }
  }, [isHomeView, reorderHomeItems, reorderItems, activeGroupId, currentFolderId]);

  const handleMoveToFolder = useCallback((folderMergePrompt: MergePrompt | null) => {
    if (!folderMergePrompt) return;
    if (isHomeView) {
      moveHomeItem(folderMergePrompt.sourceId, folderMergePrompt.targetId);
    } else {
      moveItem(folderMergePrompt.sourceId, activeGroupId || '__home__', folderMergePrompt.targetId);
    }
  }, [isHomeView, moveHomeItem, moveItem, activeGroupId]);

  return {
    handleMergeFolders,
    handleCreateFolderFromShortcuts,
    handleReorderShortcuts,
    handleMoveToFolder,
  };
}
