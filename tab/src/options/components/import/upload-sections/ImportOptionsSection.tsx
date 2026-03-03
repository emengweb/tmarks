/**
 * 导入选项 Section
 */

import type { ImportOptions } from '@/types/import'

interface ImportOptionsSectionProps {
  options: ImportOptions
  setOptions: (options: ImportOptions) => void
}

export function ImportOptionsSection({ options, setOptions }: ImportOptionsSectionProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--tab-options-title)]">
        {chrome.i18n.getMessage('import_options')}
      </label>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.skipDuplicates}
            onChange={(e) => setOptions({ ...options, skipDuplicates: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--tab-options-text)]">
            {chrome.i18n.getMessage('import_skip_duplicates')}
          </span>
        </label>
      </div>
    </div>
  )
}
