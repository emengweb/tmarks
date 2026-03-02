/**
 * 文件夹弹窗中的可排序项组件
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '../../../types/core';
import { WidgetRenderer } from '../../grid/WidgetRenderer';

interface SortableModalItemProps {
  item: Item;
  onOpenFolder?: (folderId: string) => void;
  isBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function SortableModalItem({
  item,
  onOpenFolder,
  isBatchMode,
  isSelected,
  onToggleSelect,
}: SortableModalItemProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  // 批量模式下，点击时切换选中状态
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isBatchMode && onToggleSelect) {
      // 只有在没有拖拽的情况下才触发选中
      if (!isDragging) {
        e.preventDefault();
        e.stopPropagation();
        onToggleSelect(item.id);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onPointerUp={handlePointerUp}
      className="touch-none cursor-grab active:cursor-grabbing"
    >
      <div className="h-[88px] w-[80px]">
        <WidgetRenderer
          item={item}
          onOpenFolder={onOpenFolder}
          isEditing
          isBatchMode={isBatchMode}
          isSelected={isSelected}
          onToggleSelect={onToggleSelect}
        />
      </div>
    </div>
  );
}
