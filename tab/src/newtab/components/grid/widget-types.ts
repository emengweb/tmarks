/**
 * Widget 渲染器类型定义
 */

import type { Item } from '../../types/core';

export interface WidgetRendererProps {
  item: Item;
  onUpdate?: (id: string, updates: Partial<Item>) => void;
  onRemove?: (id: string) => void;
  onOpenFolder?: (folderId: string) => void;
  isEditing?: boolean;
  isBatchMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  shortcutStyle?: 'icon' | 'card';
}
