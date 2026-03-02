/**
 * 可排序的网格项包装器
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetRenderer } from './WidgetRenderer';
import type { Item } from '../../types/core';

interface SortableGridItemProps {
  item: Item;
  onUpdate?: (id: string, updates: Partial<Item>) => void;
  onRemove?: (id: string) => void;
  isEditing?: boolean;
  onOpenFolder?: (folderId: string) => void;
  isBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  shortcutStyle?: 'icon' | 'card';
}

export function SortableGridItem({
  item,
  onUpdate,
  onRemove,
  isEditing,
  onOpenFolder,
  isBatchMode,
  isSelected,
  onToggleSelect,
  shortcutStyle,
}: SortableGridItemProps) {
  const cols = 1;
  const rows = 1;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${cols}`,
    gridRow: `span ${rows}`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none cursor-grab active:cursor-grabbing`}
    >
      <WidgetRenderer
        item={item}
        onUpdate={onUpdate}
        onRemove={onRemove}
        isEditing={isEditing}
        onOpenFolder={onOpenFolder}
        isBatchMode={isBatchMode}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        shortcutStyle={shortcutStyle}
      />
    </div>
  );
}
