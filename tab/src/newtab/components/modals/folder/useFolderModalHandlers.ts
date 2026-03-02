/**
 * 文件夹弹窗事件处理 Hook
 */

import { useNewtabStore } from '../../../hooks';
import { TIMEOUTS } from '@/lib/constants/timeouts';
import { t } from '@/lib/i18n';
import type { Item } from '../../../types/core';

interface UseFolderModalHandlersProps {
  folder: Item;
  title: string;
  setTitle: (title: string) => void;
  setIsEditingTitle: (editing: boolean) => void;
  setShowDeleteSheet: (show: boolean) => void;
  setShowDeleteAllConfirm: (show: boolean) => void;
  setIsVisible: (visible: boolean) => void;
  isBrowserSyncedFolder: boolean;
  onClose: () => void;
}

export function useFolderModalHandlers({
  folder,
  title,
  setTitle,
  setIsEditingTitle,
  setShowDeleteSheet,
  setShowDeleteAllConfirm,
  setIsVisible,
  isBrowserSyncedFolder,
  onClose,
}: UseFolderModalHandlersProps) {
  const { removeFolder, updateItem } = useNewtabStore();

  const handleDeleteFolder = () => {
    if (isBrowserSyncedFolder) return;
    setShowDeleteSheet(true);
  };

  const handleDeleteKeep = () => {
    setShowDeleteSheet(false);
    removeFolder(folder.id, 'keep');
    setIsVisible(false);
    setTimeout(onClose, TIMEOUTS.SHORT);
  };

  const handleDeleteAll = () => {
    setShowDeleteSheet(false);
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    setShowDeleteAllConfirm(false);
    removeFolder(folder.id, 'all');
    setIsVisible(false);
    setTimeout(onClose, TIMEOUTS.SHORT);
  };

  const handleTitleSave = () => {
    setIsEditingTitle(false);
    const trimmed = title.trim();
    const folderData = folder.type === 'folder' ? (folder.data as { title: string }) : { title: '' };
    const current = folderData.title || t('folder_default_name');
    if (trimmed && trimmed !== current) {
      updateItem(folder.id, { 
        data: { 
          type: 'folder',
          title: trimmed,
          icon: (folder.data as any).icon,
          isExpanded: (folder.data as any).isExpanded,
        } 
      });
    } else {
      setTitle(current);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, TIMEOUTS.SHORT);
  };

  const handleListWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight <= el.clientHeight + 1) return;

    // 每次滚动一行（行高 + gap）
    const step = 104;
    e.preventDefault();
    el.scrollBy({ top: Math.sign(e.deltaY) * step, behavior: 'smooth' });
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
    if (e.key === 'Escape') {
      const folderData = folder.type === 'folder' ? (folder.data as { title: string }) : { title: '' };
      setTitle(folderData.title || t('folder_default_name'));
      setIsEditingTitle(false);
    }
  };

  return {
    handleDeleteFolder,
    handleDeleteKeep,
    handleDeleteAll,
    confirmDeleteAll,
    handleTitleSave,
    handleClose,
    handleListWheel,
    handleTitleKeyDown,
  };
}
