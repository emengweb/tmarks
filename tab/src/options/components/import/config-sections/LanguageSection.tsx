/**
 * 语言偏好配置 Section
 */

import { Languages } from 'lucide-react'

interface LanguageSectionProps {
  language: 'zh' | 'en' | 'mixed'
  setLanguage: (value: 'zh' | 'en' | 'mixed') => void
}

export function LanguageSection({ language, setLanguage }: LanguageSectionProps) {
  const languageOptions = {
    zh: { label: '中文', desc: '标题和描述使用中文' },
    en: { label: '英文', desc: '标题和描述使用英文' },
    mixed: { label: '混合', desc: '根据内容自动选择' }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Languages className="w-4 h-4 text-[var(--tab-options-text)]" />
        <span className="text-sm font-medium text-[var(--tab-options-text)]">语言偏好</span>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="选择语言偏好">
        {(['zh', 'en', 'mixed'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setLanguage(option)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              language === option
                ? 'border-[var(--tab-popup-section-purple-badge-bg)] bg-[var(--tab-popup-section-purple-badge-bg)]/10'
                : 'border-[var(--tab-options-button-border)] hover:border-[var(--tab-popup-section-purple-badge-bg)]/50'
            }`}
            role="radio"
            aria-checked={language === option}
          >
            <div className="text-sm font-medium text-[var(--tab-options-title)]">
              {languageOptions[option].label}
            </div>
            <div className="text-xs text-[var(--tab-options-text)] mt-1">
              {languageOptions[option].desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
