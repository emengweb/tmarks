/**
 * 拖拽处理 Hook
 */

import { useCallback, useRef } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { t } from '@/lib/i18n';
import type { Item } from '../../../types/core';
import type { MergePrompt } from '../types';

interface UseDragHandlersProps {
  items: Item[];
  openFolderId: string | null;
  moveItem: (id: string, targetGroupId: string, targetParentId: string | null) => void;
  reorderItems: (groupId: string, parentId: string | null, fromIndex: number, toIndex: number) => void;
  activeGroupId: string;
  currentFolderId: string | null;
  setFolderMergePrompt: (prompt: MergePrompt | null) => void;
  setShortcutMergePrompt: (prompt: MergePrompt | null) => void;
  setActiveId: (id: string | null) => void;
  setActiveItemSnapshot: (item: Item | null) => void;
}

export function useDragHandlers({
  items,
  openFolderId,
  moveItem,
  reorderItems,
  activeGroupId,
  currentFolderId,
  setFolderMergePrompt,
  setShortcutMergePrompt,
  setActiveId,
  setActiveItemSnapshot,
}: UseDragHandlersProps) {
  const lastOverIdRef = useRef<string | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id);
      setActiveId(id);
      const snapshot = items.find((item) => item.id === id) ?? null;
      setActiveItemSnapshot(snapshot);
      lastOverIdRef.current = null;
    },
    [items, setActiveId, setActiveItemSnapshot]
  );

  const handleDragCancel = useCallback(
    () => {
      setActiveId(null);
      setActiveItemSnapshot(null);
      lastOverIdRef.current = null;
    },
    [setActiveId, setActiveItemSnapshot]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const overId = event.over?.id ? String(event.over.id) : null;
      if (lastOverIdRef.current !== overId) {
        lastOverIdRef.current = overId;
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveItemSnapshot(null);
      lastOverIdRef.current = null;

      if (!over || active.id === over.id) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // 处理从文件夹弹窗中拖出
      if (overId.startsWith('folder-modal-undock-parent:')) {
        const payload = overId.replace('folder-modal-undock-parent:', '');
        const [sourceFolderId, targetParentToken] = payload.split(':');
        const targetParentId =
          !targetParentToken || targetParentToken === 'root' ? null : targetParentToken;

        if (!targetParentToken) {
          const sourceFolder = items.find((item) => item.id === sourceFolderId);
          moveItem(activeId, activeGroupId, sourceFolder?.parentId ?? null);
          return;
        }

        moveItem(activeId, activeGroupId, targetParentId);
        return;
      }

      // 文件夹内重排序
      if (openFolderId) {
        const activeItem = items.find((item) => item.id === activeId);
        const overItem = items.find((item) => item.id === overId);
        if (
          activeItem &&
          overItem &&
          (activeItem.parentId ?? null) === openFolderId &&
          (overItem.parentId ?? null) === openFolderId
        ) {
          reorderItems(activeGroupId, openFolderId, 0, 1);
          return;
        }
      }

      const overItem = items.find((item) => item.id === overId);
      
      // 拖到文件夹上
      if (overItem?.type === 'folder') {
        const activeItem = items.find((item) => item.id === activeId);

        if (activeItem?.type === 'folder') {
          const activeData = activeItem.data as { type: 'folder'; title: string }
          const overData = overItem.data as { type: 'folder'; title: string }
          setFolderMergePrompt({
            sourceId: activeId,
            targetId: overItem.id,
            sourceName: activeData.title || t('widget_folder'),
            targetName: overData.title || t('widget_folder'),
          });
          return;
        }

        moveItem(activeId, activeGroupId, overItem.id);
        return;
      }

      // 两个快捷方式碰撞
      const activeItem = items.find((item) => item.id === activeId);
      if (activeItem?.type === 'shortcut' && overItem?.type === 'shortcut') {
        const activeData = activeItem.data as { type: 'shortcut'; title: string }
        const overData = overItem.data as { type: 'shortcut'; title: string }
        setShortcutMergePrompt({
          sourceId: activeId,
          targetId: overId,
          sourceName: activeData.title || t('widget_shortcut'),
          targetName: overData.title || t('widget_shortcut'),
        });
        return;
      }

      reorderItems(activeGroupId, currentFolderId, 0, 1);
    },
    [
      items,
      openFolderId,
      moveItem,
      reorderItems,
      activeGroupId,
      currentFolderId,
      setFolderMergePrompt,
      setShortcutMergePrompt,
      setActiveId,
      setActiveItemSnapshot,
    ]
  );

  return {
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
  };
}
