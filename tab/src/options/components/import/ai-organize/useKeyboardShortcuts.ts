/**
 * 键盘快捷键 Hook
 */

import { useEffect } from 'react'
import type { ProcessStatus } from './useAIOrganizeState'

interface KeyboardShortcutsOptions {
  status: ProcessStatus
  isPaused: boolean
  onPauseResume: () => void
  onStop: () => void
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions) {
  const { status, isPaused, onPauseResume, onStop } = options

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 仅在处理中时响应快捷键
      if (status !== 'processing') return

      // Ctrl/Cmd + P: 暂停/恢复
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
        onPauseResume()
      }
      
      // Escape: 停止
      if (e.key === 'Escape') {
        e.preventDefault()
        const shouldStop = window.confirm('确定要停止 AI 整理吗？')
        if (shouldStop) {
          onStop()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, isPaused, onPauseResume, onStop])
}
