/**
 * 格式选择 Section
 */

import { FileText, Code } from 'lucide-react'
import type { ImportFormat } from '@/types/import'

interface FormatSelectorProps {
  selectedFormat: ImportFormat
  setSelectedFormat: (format: ImportFormat) => void
}

export function FormatSelector({ selectedFormat, setSelectedFormat }: FormatSelectorProps) {
  const formatOptions = [
    {
      value: 'html' as ImportFormat,
      label: chrome.i18n.getMessage('import_format_html'),
      description: chrome.i18n.getMessage('import_format_browser'),
      icon: FileText
    },
    {
      value: 'json' as ImportFormat,
      label: chrome.i18n.getMessage('import_format_json'),
      description: chrome.i18n.getMessage('import_format_tmarks'),
      icon: Code
    }
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--tab-options-title)]">
        {chrome.i18n.getMessage('import_select_format')}
      </label>
      <div className="grid grid-cols-2 gap-3">
        {formatOptions.map((format) => {
          const Icon = format.icon
          return (
            <div
              key={format.value}
              className={`relative rounded-lg border p-3 cursor-pointer ${
                selectedFormat === format.value 
                  ? 'border-[var(--tab-message-info-border)] bg-[var(--tab-message-info-bg)]' 
                  : 'border-[var(--tab-options-button-border)]'
              }`}
              onClick={() => setSelectedFormat(format.value)}
            >
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--tab-options-title)]">{format.label}</div>
                  <p className="text-xs text-[var(--tab-options-text)] mt-0.5">{format.description}</p>
                </div>
                <input
                  type="radio"
                  checked={selectedFormat === format.value}
                  onChange={() => setSelectedFormat(format.value)}
                  className="h-4 w-4"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
