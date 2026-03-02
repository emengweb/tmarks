/**
 * 自定义风格配置 Section
 */

import { Settings } from 'lucide-react'

interface CustomStyleSectionProps {
  mode: 'tmarks' | 'newtab'
  useCustomStyle: boolean
  setUseCustomStyle: (value: boolean) => void
  customStyle: string
  setCustomStyle: (value: string) => void
}

export function CustomStyleSection({
  mode,
  useCustomStyle,
  setUseCustomStyle,
  customStyle,
  setCustomStyle
}: CustomStyleSectionProps) {
  const getPlaceholder = () => {
    if (mode === 'tmarks') {
      return '例如：使用中文，技术类用具体框架名（React、Vue），工具类用功能描述，避免过于宽泛的词'
    }
    return '例如：按使用场景分类，开发相关放"工作"，娱乐相关放"休闲"，学习资料放"学习"'
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Settings className="w-4 h-4 text-[var(--tab-options-text)]" />
        <span className="text-sm font-medium text-[var(--tab-options-text)]">
          自定义{mode === 'tmarks' ? '标签' : '分组'}风格
        </span>
      </div>
      <div className="p-4 bg-[var(--tab-options-card-bg)] rounded-lg border border-[var(--tab-options-button-border)]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useCustomStyle}
            onChange={(e) => setUseCustomStyle(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--tab-options-text)]">
            启用自定义风格指导
          </span>
        </label>
        {useCustomStyle && (
          <textarea
            value={customStyle}
            onChange={(e) => setCustomStyle(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full mt-3 p-3 bg-[var(--tab-options-input-bg)] border border-[var(--tab-options-button-border)] rounded-lg text-sm text-[var(--tab-options-text)] resize-none"
            rows={3}
          />
        )}
      </div>
    </div>
  )
}
