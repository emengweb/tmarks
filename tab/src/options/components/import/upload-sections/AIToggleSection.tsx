/**
 * AI 整理开关 Section
 */

import { Sparkles } from 'lucide-react'
import type { NormalizeResult } from '@/lib/import/normalizer'

interface AIToggleSectionProps {
  enableAiOrganize: boolean
  setEnableAiOrganize: (enable: boolean) => void
  isAiRequired: boolean
  selectedFile: File | null
  normalizeResult: NormalizeResult | null
}

export function AIToggleSection({
  enableAiOrganize,
  setEnableAiOrganize,
  isAiRequired,
  selectedFile,
  normalizeResult
}: AIToggleSectionProps) {
  return (
    <div className={`p-4 rounded-lg border ${enableAiOrganize ? 'bg-[var(--tab-message-info-bg)] border-[var(--tab-message-info-border)]' : 'bg-[var(--tab-options-card-bg)] border-[var(--tab-options-button-border)]'} ${isAiRequired ? 'opacity-75' : ''}`}>
      <label className={`flex items-center justify-between ${isAiRequired ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${enableAiOrganize ? 'bg-[var(--tab-message-info-icon)] text-[var(--tab-message-info-icon-text)]' : 'bg-[var(--tab-options-button-hover-bg)]'}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--tab-options-title)]">
              {chrome.i18n.getMessage('import_enable_ai')}
              {isAiRequired && <span className="ml-2 text-xs text-[var(--tab-message-warning-icon)]">(HTML格式必需)</span>}
            </div>
            <div className="text-xs text-[var(--tab-options-text)]">
              {isAiRequired 
                ? 'HTML格式书签没有标签信息，必须使用AI生成标签'
                : selectedFile && normalizeResult
                  ? `已提取 ${normalizeResult.validUrls.length} 个有效 URL`
                  : chrome.i18n.getMessage('import_ai_hint')
              }
            </div>
          </div>
        </div>
        <input
          type="checkbox"
          checked={enableAiOrganize}
          onChange={(e) => setEnableAiOrganize(e.target.checked)}
          disabled={isAiRequired}
          className="w-5 h-5 disabled:cursor-not-allowed"
        />
      </label>
    </div>
  )
}
