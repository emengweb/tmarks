/**
 * 侧边栏图标工具函数
 */

import {
  Home,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Wrench,
  Code,
  Music,
  Film,
  ShoppingCart,
  Heart,
  Star,
  Bookmark,
  Folder,
  Globe,
  Zap,
} from 'lucide-react';

// 图标映射
export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Wrench,
  Code,
  Music,
  Film,
  ShoppingCart,
  Heart,
  Star,
  Bookmark,
  Folder,
  Globe,
  Zap,
};

export function getIconComponent(iconName: string) {
  return ICON_MAP[iconName] || Folder;
}
