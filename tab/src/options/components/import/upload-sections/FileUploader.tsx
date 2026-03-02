/**
 * 文件上传 Section
 */

import { Upload, CheckCircle, Loader2, X } from 'lucide-react'
import type { NormalizeResult, NormalizeProgress } from '@/lib/import/normalizer'

interface FileUploaderProps {
  selectedFile: File | null
  isValidating: boolean
  normalizeResult: NormalizeResult | null
  normalizeProgress: NormalizeProgress | null
  onFileSelect: (file: File) => void
  onReset: () => void
}

export function FileUploader({
  selectedFile,
  isValidating,
  normalizeResult,
  normalizeProgress,
  onFileSelect,
  onReset
}: FileUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--tab-options-title)]">
        {chrome.i18n.getMessage('import_select_file')}
      </label>
      
      {selectedFile ? (
        <div className="p-6 border-2 border-dashed border-[var(--tab-options-button-border)] rounded-lg text-center">
          {isValidating || normalizeProgress ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 text-[var(--tab-message-info-icon)] animate-spin" />
              <div className="w-full">
                <p className="text-lg font-medium text-[var(--tab-options-title)]">
                  {normalizeProgress ? normalizeProgress.status : chrome.i18n.getMessage('import_validating')}
                </p>
                {normalizeProgress && (
                  <div className="mt-3 w-full max-w-md mx-auto">
                    <div className="h-2 bg-[var(--tab-options-button-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--tab-message-info-icon)] transition-all duration-300"
                        style={{ width: `${(normalizeProgress.current / normalizeProgress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--tab-options-text)] mt-2">
                      {normalizeProgress.current} / {normalizeProgress.total}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : normalizeResult ? (
            <div className="flex flex-col items-center space-y-3">
              <CheckCircle className="h-8 w-8 text-[var(--tab-message-success-icon)]" />
              <div>
                <p className="text-lg font-medium text-[var(--tab-options-title)]">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-[var(--tab-options-text)] mt-1">
                  {chrome.i18n.getMessage('import_file_valid', String(normalizeResult.validUrls.length))}
                </p>
                {normalizeResult.stats.invalid > 0 && (
                  <p className="text-xs text-[var(--tab-message-warning-icon)] mt-1">
                    {chrome.i18n.getMessage('import_file_invalid', String(normalizeResult.stats.invalid))}
                  </p>
                )}
              </div>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--tab-options-text)] hover:text-[var(--tab-options-title)] transition-colors"
              >
                <X className="w-4 h-4" />
                {chrome.i18n.getMessage('import_change_file')}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[var(--tab-options-button-border)] rounded-lg cursor-pointer hover:border-[var(--tab-message-info-border)] hover:bg-[var(--tab-message-info-bg)] transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-3 text-[var(--tab-options-text)]" />
            <p className="mb-2 text-sm text-[var(--tab-options-text)]">
              <span className="font-semibold">{chrome.i18n.getMessage('import_click_upload')}</span>
            </p>
            <p className="text-xs text-[var(--tab-options-text)]">
              {chrome.i18n.getMessage('import_file_hint')}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".html,.json"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  )
}
