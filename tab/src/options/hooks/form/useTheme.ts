/**
 * 主题管理
 */

import { useEffect } from 'react'
import { applyTheme, applyThemeStyle, initThemeListener } from '@/lib/utils/themeManager'

export function useTheme(theme: 'light' | 'dark' | 'auto', themeStyle: 'default' | 'bw' | 'tmarks') {
  useEffect(() => {
    applyTheme(theme)
    return initThemeListener(() => theme)
  }, [theme])

  useEffect(() => {
    applyThemeStyle(themeStyle)
  }, [themeStyle])
}
