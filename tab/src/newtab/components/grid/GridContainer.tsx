/**
 * 组件网格 - 统一渲染快捷方式和小组件
 * 支持分页显示和拖拽排序
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { t } from '@/lib/i18n';
import { useNewtabStore } from '../../hooks';
import { Z_INDEX } from '../../constants/z-index';
import { WidgetRenderer } from './WidgetRenderer';
import { BookmarkFolderModal } from '../modals/BookmarkFolderModal';
import { SortableGridItem } from './GridItem';
import { ActionSheet } from '../ui/ActionSheet';
import { useDragHandlers, useGridPagination, useMergeHandlers, useKeyboardNavigation } from './hooks';
import { PageIndicator, EditButton, BatchSelectBar } from './components';
import { GRID_COLS_MAP } from './types';
import type { WidgetGridProps, MergePrompt } from './types';
import type { Item } from '../../types/core';

export default function GridContainer({
  columns,
  rows = 4,
  isBatchMode,
  batchSelectedIds,
  onBatchSelectedIdsChange,
  isEditing = false,
  onEditingChange,
}: WidgetGridProps) {
  const {
    items,
    homeItems,
    activeView,
    addItem,
    addHomeItem,
    updateItem,
    updateHomeItem,
    removeItem,
    removeHomeItem,
    getFilteredItems,
    getFilteredHomeItems,
    currentFolderId,
    setCurrentFolder,
    moveItem,
    moveHomeItem,
    reorderItems,
    reorderHomeItems,
    activeGroupId,
    settings,
  } = useNewtabStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItemSnapshot, setActiveItemSnapshot] = useState<Item | null>(null);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [folderMergePrompt, setFolderMergePrompt] = useState<MergePrompt | null>(null);
  const [shortcutMergePrompt, setShortcutMergePrompt] = useState<MergePrompt | null>(null);

  const isHomeView = activeView === 'home';
  const currentItems = isHomeView ? homeItems : items;
  const filteredItems = isHomeView ? getFilteredHomeItems() : getFilteredItems();
  const currentAddItem = isHomeView ? addHomeItem : addItem;
  const currentUpdateItem = isHomeView ? updateHomeItem : updateItem;
  const currentRemoveItem = isHomeView ? removeHomeItem : removeItem;

  const {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel,
  } = useGridPagination({ items: filteredItems, columns, rows });

  useKeyboardNavigation({ goToNextPage, goToPrevPage });

  const {
    handleMergeFolders: mergeFolders,
    handleCreateFolderFromShortcuts: createFolderFromShortcuts,
    handleReorderShortcuts: reorderShortcuts,
    handleMoveToFolder: moveToFolder,
  } = useMergeHandlers({
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
  });

  const { handleDragStart, handleDragCancel, handleDragOver, handleDragEnd } = useDragHandlers({
    items: currentItems,
    openFolderId,
    moveItem: (id: string, targetGroupId: string, targetParentId: string | null) => {
      if (isHomeView) {
        moveHomeItem(id, targetParentId);
      } else {
        moveItem(id, targetGroupId, targetParentId);
      }
    },
    reorderItems: (groupId: string, parentId: string | null, fromIndex: number, toIndex: number) => {
      if (isHomeView) {
        reorderHomeItems(parentId, fromIndex, toIndex);
      } else {
        reorderItems(groupId, parentId, fromIndex, toIndex);
      }
    },
    activeGroupId: isHomeView ? '__home__' : (activeGroupId || '__home__'),
    currentFolderId,
    setFolderMergePrompt,
    setShortcutMergePrompt,
    setActiveId,
    setActiveItemSnapshot,
  });

  const openFolder = useMemo(
    () =>
      openFolderId
        ? currentItems.find((item) => item.id === openFolderId && item.type === 'folder') ?? null
        : null,
    [currentItems, openFolderId]
  );

  const openFolderItems = useMemo(() => {
    if (!openFolder) return [];
    return currentItems
      .filter((item) => (item.parentId ?? null) === openFolder.id)
      .sort((a, b) => a.position - b.position);
  }, [currentItems, openFolder]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleMergeFoldersWrapper = useCallback(() => {
    mergeFolders(folderMergePrompt);
    setFolderMergePrompt(null);
  }, [folderMergePrompt, mergeFolders]);

  const handleCreateFolderFromShortcutsWrapper = useCallback(() => {
    createFolderFromShortcuts(shortcutMergePrompt);
    setShortcutMergePrompt(null);
  }, [shortcutMergePrompt, createFolderFromShortcuts]);

  const handleReorderShortcutsWrapper = useCallback(() => {
    reorderShortcuts();
    setShortcutMergePrompt(null);
  }, [reorderShortcuts]);

  const handleMoveToFolderWrapper = useCallback(() => {
    moveToFolder(folderMergePrompt);
    setFolderMergePrompt(null);
  }, [folderMergePrompt, moveToFolder]);

  const handleOpenFolder = useCallback((folderId: string) => {
    setOpenFolderId(folderId);
  }, []);

  const handleToggleSelect = useCallback(
    (id: string) => {
      if (!onBatchSelectedIdsChange) return;
      const prev = batchSelectedIds ?? new Set<string>();
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onBatchSelectedIdsChange(next);
    },
    [batchSelectedIds, onBatchSelectedIdsChange]
  );

  useEffect(() => {
    if (currentFolderId) {
      setOpenFolderId(currentFolderId);
      setCurrentFolder(null);
    }
  }, [currentFolderId, setCurrentFolder]);

  const activeItem =
    activeItemSnapshot ?? (activeId ? currentItems.find((item) => item.id === activeId) : null);

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 text-white/50">
        <span className="text-sm">{t('empty_group')}</span>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={paginatedItems.map((item) => item.id)} strategy={rectSortingStrategy}>
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
          >
            <div className={`grid ${GRID_COLS_MAP[columns]} gap-4 auto-rows-[80px]`}>
              {paginatedItems.map((item) => (
                <SortableGridItem
                  key={item.id}
                  item={item}
                  onUpdate={currentUpdateItem}
                  onRemove={currentRemoveItem}
                  isEditing={isEditing}
                  onOpenFolder={handleOpenFolder}
                  isBatchMode={isBatchMode}
                  isSelected={!!batchSelectedIds?.has(item.id)}
                  onToggleSelect={handleToggleSelect}
                  shortcutStyle={settings.shortcutStyle || 'icon'}
                />
              ))}
            </div>

            <PageIndicator
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </SortableContext>

        {typeof document !== 'undefined' &&
          createPortal(
            <DragOverlay zIndex={Z_INDEX.DRAG_OVERLAY}>
              {activeItem ? (
                <div className="opacity-80 pointer-events-none">
                  <WidgetRenderer
                    item={activeItem}
                    onOpenFolder={handleOpenFolder}
                    isEditing
                    isBatchMode={isBatchMode}
                    isSelected={!!batchSelectedIds?.has(activeItem.id)}
                    onToggleSelect={handleToggleSelect}
                    shortcutStyle={settings.shortcutStyle || 'icon'}
                  />
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}

        {openFolder && (
          <BookmarkFolderModal
            folder={openFolder}
            items={openFolderItems}
            isOpen
            onClose={() => setOpenFolderId(null)}
            onOpenFolder={handleOpenFolder}
            isBatchMode={isBatchMode}
            batchSelectedIds={batchSelectedIds}
            onBatchSelectedIdsChange={onBatchSelectedIdsChange}
          />
        )}
      </DndContext>

      <EditButton isEditing={isEditing} onToggle={() => onEditingChange?.(!isEditing)} />

      {isBatchMode && batchSelectedIds && onBatchSelectedIdsChange && (
        <BatchSelectBar
          filteredItems={filteredItems}
          batchSelectedIds={batchSelectedIds}
          onBatchSelectedIdsChange={onBatchSelectedIdsChange}
        />
      )}

      <ActionSheet
        isOpen={!!folderMergePrompt}
        title={t('newtab_folder_action')}
        message={t('newtab_drag_to', [folderMergePrompt?.sourceName || '', folderMergePrompt?.targetName || ''])}
        actions={[
          { label: t('newtab_merge_folders'), onClick: handleMergeFoldersWrapper },
          { label: t('newtab_move_to_folder'), onClick: handleMoveToFolderWrapper },
        ]}
        onCancel={() => setFolderMergePrompt(null)}
      />

      <ActionSheet
        isOpen={!!shortcutMergePrompt}
        title={t('newtab_create_folder')}
        message={t('newtab_drag_to', [shortcutMergePrompt?.sourceName || '', shortcutMergePrompt?.targetName || ''])}
        actions={[
          { label: t('newtab_merge_to_folder'), onClick: handleCreateFolderFromShortcutsWrapper },
          { label: t('newtab_reorder_only'), onClick: handleReorderShortcutsWrapper },
        ]}
        onCancel={() => setShortcutMergePrompt(null)}
      />
    </>
  );
}
