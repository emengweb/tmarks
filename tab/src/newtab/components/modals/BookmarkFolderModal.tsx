/**
 * 书签文件夹弹窗组件（协调器）
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2, X } from 'lucide-react';
import { t } from '@/lib/i18n';
import { ActionSheet } from '../ui/ActionSheet';
import { ConfirmModal } from '../ui/ConfirmModal';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import type { Item } from '../../types/core';
import { Z_INDEX } from '../../constants/z-index';
import { SortableModalItem } from './folder/SortableModalItem';
import { useFolderModalState } from './folder/useFolderModalState';
import { useFolderModalHandlers } from './folder/useFolderModalHandlers';

interface BookmarkFolderModalProps {
  folder: Item;
  items: Item[];
  isOpen: boolean;
  onClose: () => void;
  onOpenFolder?: (folderId: string) => void;
  isBatchMode?: boolean;
  batchSelectedIds?: Set<string>;
  onBatchSelectedIdsChange?: (next: Set<string>) => void;
}

export function BookmarkFolderModal({
  folder,
  items,
  isOpen,
  onClose,
  onOpenFolder,
  isBatchMode,
  batchSelectedIds,
  onBatchSelectedIdsChange,
}: BookmarkFolderModalProps) {
  
  const state = useFolderModalState(folder, isOpen);
  const handlers = useFolderModalHandlers({
    folder,
    title: state.title,
    setTitle: state.setTitle,
    setIsEditingTitle: state.setIsEditingTitle,
    setShowDeleteSheet: state.setShowDeleteSheet,
    setShowDeleteAllConfirm: state.setShowDeleteAllConfirm,
    setIsVisible: state.setIsVisible,
    isBrowserSyncedFolder: state.isBrowserSyncedFolder,
    onClose,
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const parentHint = state.effectiveParentId
    ? t('folder_parent_hint_up')
    : folder.groupId && folder.groupId !== '__home__'
      ? t('folder_parent_hint_group')
      : t('folder_parent_hint_home');

  const tileHeight = 88;
  const gap = 16;
  const visibleRows = 3;
  const listHeight = tileHeight * visibleRows + gap * (visibleRows - 1);

  return createPortal(
    <div
      data-folder-modal="1"
      ref={state.setOutsideDropRef}
      className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-200 ${
        state.isVisible ? 'bg-black/60 backdrop-blur-md opacity-100' : 'opacity-0'
      } ${state.isOverOutside ? 'bg-black/70' : ''}`}
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handlers.handleClose();
      }}
    >
      <div
        ref={state.dialogRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-label={state.title}
        className={`liquid-glass rounded-3xl w-full max-w-2xl shadow-2xl transition-all duration-200 ease-[cubic-bezier(0.33,1,0.68,1)] ${
          state.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {state.isEditingTitle ? (
              <input
                ref={state.titleInputRef}
                type="text"
                value={state.title}
                onChange={(e) => state.setTitle(e.target.value)}
                onBlur={handlers.handleTitleSave}
                onKeyDown={handlers.handleTitleKeyDown}
                className="liquid-glass-mini border border-white/30 rounded-lg px-3 py-1.5 text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-white/40 w-full max-w-[320px] transition-all"
              />
            ) : (
              <button
                type="button"
                onClick={() => state.setIsEditingTitle(true)}
                className="text-lg font-medium text-white truncate flex items-center gap-2 hover:text-blue-300 transition-colors"
                title={t('folder_click_rename')}
              >
                <span className="truncate">{state.title}</span>
                <Edit2 className="w-4 h-4 opacity-60" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!state.isBrowserSyncedFolder && (
              <button
                type="button"
                onClick={handlers.handleDeleteFolder}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-red-400"
                aria-label={t('folder_delete')}
                title={t('folder_delete')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={handlers.handleClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label={t('options_close')}
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div
            ref={state.setDropRef}
            className={`rounded-2xl p-4 transition-colors ${state.isOverDrop ? 'bg-white/10' : 'bg-white/5'}`}
          >
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div
                ref={state.listRef}
                onWheel={handlers.handleListWheel}
                className="overflow-y-auto pr-1"
                style={{ height: `${listHeight}px` }}
              >
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 min-h-[140px]">
                  {items.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-white/50 text-sm">{t('folder_empty')}</div>
                  ) : (
                    items.map((item) => (
                      <SortableModalItem
                        key={item.id}
                        item={item}
                        onOpenFolder={onOpenFolder}
                        isBatchMode={isBatchMode}
                        isSelected={batchSelectedIds?.has(item.id)}
                        onToggleSelect={(id) => {
                          if (!onBatchSelectedIdsChange) return;
                          const next = new Set(batchSelectedIds ?? []);
                          if (next.has(id)) next.delete(id);
                          else next.add(id);
                          onBatchSelectedIdsChange(next);
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            </SortableContext>
          </div>

          <div className="mt-4">
            <div
              ref={state.setUndockParentDropRef}
              className={`rounded-2xl px-4 py-3 text-sm text-white/70 border border-dashed transition-colors ${
                state.isOverUndockParent ? 'bg-white/10 border-white/40' : 'bg-white/5 border-white/20'
              }`}
              title={(folder.parentId ?? null) ? t('folder_parent_hint_up') : t('folder_parent_hint_home')}
            >
              {t('folder_move_up', parentHint)}
            </div>
          </div>
        </div>
      </div>

      {/* 删除文件夹操作表 */}
      <ActionSheet
        isOpen={state.showDeleteSheet}
        title={t('folder_delete_title')}
        message={t('folder_delete_message')}
        actions={[
          { label: t('folder_delete_keep'), onClick: handlers.handleDeleteKeep },
          { label: t('folder_delete_all'), onClick: handlers.handleDeleteAll, variant: 'danger' },
        ]}
        onCancel={() => state.setShowDeleteSheet(false)}
      />

      {/* 删除全部确认弹窗 */}
      <ConfirmModal
        isOpen={state.showDeleteAllConfirm}
        title={t('folder_delete_confirm_title')}
        message={t('folder_delete_confirm_message')}
        confirmText={t('ui_delete')}
        cancelText={t('btn_cancel')}
        confirmVariant="danger"
        onConfirm={handlers.confirmDeleteAll}
        onCancel={() => state.setShowDeleteAllConfirm(false)}
      />
    </div>,
    document.body
  );
}
