/**
 * 文件夹弹窗状态管理 Hook
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useFocusTrap } from '@/lib/hooks/useFocusTrap';
import { useScrollLock } from '@/lib/hooks/useScrollLock';
import { useNewtabStore } from '../../../hooks';
import { t } from '@/lib/i18n';
import type { Item } from '../../../types/core';

export function useFolderModalState(folder: Item, isOpen: boolean) {
  const { browserBookmarksRootId, homeBrowserFolderId } = useNewtabStore();
  const [isVisible, setIsVisible] = useState(false);
  
  const folderData = folder.type === 'folder' ? (folder.data as { title: string }) : { title: '' };
  const [title, setTitle] = useState(folderData.title || t('folder_default_name'));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [effectiveParentId, setEffectiveParentId] = useState<string | null>(folder.parentId ?? null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 焦点陷阱和滚动锁定
  const dialogRef = useFocusTrap(isOpen);
  useScrollLock(isOpen);

  const isBrowserSyncedFolder = !!folder.browserBookmarkId;

  const dropId = useMemo(() => `folder-modal:${folder.id}`, [folder.id]);
  const outsideDropId = useMemo(() => `folder-modal-outside:${folder.id}`, [folder.id]);
  const undockParentDropId = useMemo(
    () => `folder-modal-undock-parent:${folder.id}:${effectiveParentId ?? 'root'}`,
    [folder.id, effectiveParentId]
  );

  const { setNodeRef: setDropRef, isOver: isOverDrop } = useDroppable({ id: dropId });
  const { setNodeRef: setOutsideDropRef, isOver: isOverOutside } = useDroppable({ id: outsideDropId });
  const { setNodeRef: setUndockParentDropRef, isOver: isOverUndockParent } = useDroppable({
    id: undockParentDropId,
    disabled: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => setIsVisible(true));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const folderData = folder.type === 'folder' ? (folder.data as { title: string }) : { title: '' };
    setTitle(folderData.title || t('folder_default_name'));
    setIsEditingTitle(false);
  }, [folder, isOpen]);

  useEffect(() => {
    setEffectiveParentId(folder.parentId ?? null);
  }, [folder.parentId]);

  useEffect(() => {
    if (!isOpen) return;
    if (!folder.browserBookmarkId) return;
    if ((folder.parentId ?? null) !== null) return;
    if (typeof chrome === 'undefined' || !chrome.bookmarks) return;

    (async () => {
      try {
        const nodes = await chrome.bookmarks.get(folder.browserBookmarkId!);
        const node = nodes?.[0];
        const parentBookmarkId = node?.parentId ?? null;
        if (!parentBookmarkId) return;

        if (
          parentBookmarkId === browserBookmarksRootId ||
          parentBookmarkId === homeBrowserFolderId
        ) {
          setEffectiveParentId(null);
          return;
        }

        const state = useNewtabStore.getState();
        const groupRootBookmarkId =
          folder.groupId && folder.groupId !== '__home__'
            ? state.groups.find((g) => g.id === folder.groupId)?.bookmarkFolderId
            : undefined;
        if (groupRootBookmarkId && parentBookmarkId === groupRootBookmarkId) {
          setEffectiveParentId(null);
          return;
        }

        setEffectiveParentId(`bb-${parentBookmarkId}`);
      } catch {
        // ignore
      }
    })();
  }, [
    isOpen,
    folder.browserBookmarkId,
    folder.parentId,
    folder.groupId,
    browserBookmarksRootId,
    homeBrowserFolderId,
  ]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (!isOpen) {
      setIsVisible(false);
    }
  }, [isOpen]);

  return {
    isVisible,
    setIsVisible,
    title,
    setTitle,
    isEditingTitle,
    setIsEditingTitle,
    showDeleteSheet,
    setShowDeleteSheet,
    showDeleteAllConfirm,
    setShowDeleteAllConfirm,
    effectiveParentId,
    titleInputRef,
    listRef,
    dialogRef,
    isBrowserSyncedFolder,
    setDropRef,
    isOverDrop,
    setOutsideDropRef,
    isOverOutside,
    setUndockParentDropRef,
    isOverUndockParent,
  };
}
