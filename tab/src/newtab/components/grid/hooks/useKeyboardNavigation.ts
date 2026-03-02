/**
 * 键盘导航 Hook
 */

import { useEffect } from 'react';

interface UseKeyboardNavigationProps {
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

export function useKeyboardNavigation({ goToNextPage, goToPrevPage }: UseKeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入框内，不处理
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPrevPage]);
}
