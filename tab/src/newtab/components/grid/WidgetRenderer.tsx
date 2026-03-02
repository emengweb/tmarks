/**
 * 组件渲染器 - 渲染所有类型的 Item
 */

import { memo } from 'react';
import type { Item } from '../../types/core';
import type { WidgetRendererProps } from './widget-types';
import { ShortcutWidget } from './ShortcutWidget';
import { BookmarkFolderWidget } from './FolderWidget';

// 组件映射
const WIDGET_COMPONENTS: Record<string, React.ComponentType<WidgetRendererProps>> = {
  shortcut: ShortcutWidget,
  folder: BookmarkFolderWidget,
};

interface Props {
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

export const WidgetRenderer = memo(function WidgetRenderer({
  item,
  onUpdate,
  onRemove,
  isEditing = false,
  onOpenFolder,
  isBatchMode,
  isSelected,
  onToggleSelect,
  shortcutStyle,
}: Props) {
  const Component = WIDGET_COMPONENTS[item.type];

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-full text-white/50">
        未知组件类型: {item.type}
      </div>
    );
  }

  return (
    <Component
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
  );
});
