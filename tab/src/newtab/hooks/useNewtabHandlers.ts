/**
 * NewTab 事件处理 Hook
 */

import { useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';
import type { Group } from '../types/core';

interface UseNewtabHandlersProps {
  groups: Group[];
  activeView: 'home' | 'group';
  activeGroupId: string | null;
  setActiveGroup: (groupId: string | null) => void;
  setIsEditing: (editing: boolean | ((prev: boolean) => boolean)) => void;
  setContextMenu: (menu: { x: number; y: number } | null) => void;
}

export function useNewtabHandlers({
  groups,
  activeView,
  activeGroupId,
  setActiveGroup,
  setIsEditing,
  setContextMenu,
}: UseNewtabHandlersProps) {
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const isWheelLocked = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressStartPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // 使用 ref 存储最新的状态，避免 handleWheel 频繁重建
  const stateRef = useRef({ groups, activeView, activeGroupId, setActiveGroup });
  stateRef.current = { groups, activeView, activeGroupId, setActiveGroup };

  // 滚轮切换分组
  const handleWheel = useCallback((e: WheelEvent) => {
    const { groups, activeView: currentView, activeGroupId: currentGroupId, setActiveGroup: setGroup } = stateRef.current;
    
    if (isWheelLocked.current) return;
    
    // 检查是否在可滚动元素内
    const target = e.target as HTMLElement;
    const scrollableParent = target.closest('.overflow-y-auto, .overflow-auto');
    if (scrollableParent) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableParent;
      if (scrollHeight > clientHeight) {
        if (e.deltaY < 0 && scrollTop > 0) return;
        if (e.deltaY > 0 && scrollTop + clientHeight < scrollHeight) return;
      }
    }

    // 根据鼠标位置判断区域：左30% | 中间40% | 右30%
    const mouseX = e.clientX;
    const windowWidth = window.innerWidth;
    const leftBoundary = windowWidth * 0.3;
    const rightBoundary = windowWidth * 0.7;
    
    // 中间 40% 区域：让 WidgetGrid 处理图标翻页
    if (mouseX >= leftBoundary && mouseX <= rightBoundary) return;

    if (groups.length === 0) return;
    
    // 构建视图列表：['home', group1, group2, ...]
    const views = ['home', ...groups.map(g => g.id)];
    const currentViewId = currentView === 'home' ? 'home' : currentGroupId || 'home';
    const currentIndex = views.indexOf(currentViewId);
    
    if (currentIndex === -1) {
      setGroup(groups[0].id);
      return;
    }
    
    let newIndex = currentIndex;
    if (e.deltaY > 0) {
      newIndex = Math.min(currentIndex + 1, views.length - 1);
    } else if (e.deltaY < 0) {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    if (newIndex !== currentIndex) {
      e.preventDefault();
      const newViewId = views[newIndex];
      if (newViewId === 'home') {
        setGroup(null);
      } else {
        setGroup(newViewId);
      }
      isWheelLocked.current = true;
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      wheelTimeoutRef.current = setTimeout(() => {
        isWheelLocked.current = false;
      }, 300);
    }
  }, []);

  // 右键菜单处理
  const handleContextMenu = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInModal = target.closest('[role="dialog"]') || target.closest('.glass-modal') || target.closest('.glass-modal-dark');
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    
    if (!isInModal && !isInput) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  }, [setContextMenu]);

  // 长按处理
  const clearLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressStartPosRef.current = null;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    const isInModal = target.closest('[role="dialog"]') || target.closest('.glass-modal') || target.closest('.glass-modal-dark');
    const isInteractive = target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea');
    const isShortcutItem = target.closest('[data-shortcut-item]');
    
    if (isInModal || isInteractive || isShortcutItem) return;
    
    clearLongPress();
    longPressStartPosRef.current = { x: e.clientX, y: e.clientY };
    longPressTimerRef.current = window.setTimeout(() => {
      setIsEditing((prev) => !prev);
      clearLongPress();
    }, 1500);
  }, [clearLongPress, setIsEditing]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!longPressStartPosRef.current) return;
    const dx = e.clientX - longPressStartPosRef.current.x;
    const dy = e.clientY - longPressStartPosRef.current.y;
    if (Math.hypot(dx, dy) > 10) {
      clearLongPress();
    }
  }, [clearLongPress]);

  const handlePointerUp = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  const handleWallpaperRefresh = useCallback(() => {
    logger.debug('Wallpaper refreshed');
  }, []);

  return {
    handleWheel,
    handleContextMenu,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWallpaperRefresh,
    wheelTimeoutRef,
  };
}
