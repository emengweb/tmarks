/**
 * 导入执行步骤组件
 */

import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import type { ParsedBookmark, ImportResult } from '@/types/import'

interface ImportStepProps {
  bookmarks: ParsedBookmark[]
  isImporting: boolean
  importProgress: { current: number; total: number; status: string } | null
  importResult: ImportResult | null
  onImport: (bookmarks: ParsedBookmark[]) => void
}

export function ImportStep({
  bookmarks,
  isImporting,
  importProgress,
  importResult,
  onImport
}: ImportStepProps) {
  
  if (importResult) {
    const totalCount = importResult.total || (importResult.imported + importResult.skipped + importResult.failed);
    const successCount = importResult.imported || 0;
    const hasSuccess = successCount > 0;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            hasSuccess ? 'bg-[var(--tab-message-success-bg)]' : 'bg-[var(--tab-message-danger-bg)]'
          }`}>
            {hasSuccess ? (
              <CheckCircle className="w-5 h-5 text-[var(--tab-message-success-icon)]" />
            ) : (
              <XCircle className="w-5 h-5 text-[var(--tab-message-danger-icon)]" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">{chrome.i18n.getMessage('import_result_title')}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-[var(--tab-message-success-icon)]">{successCount}</div>
            <div className="text-xs text-[var(--tab-options-text)]">{chrome.i18n.getMessage('import_result_success')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[var(--tab-message-danger-icon)]">{importResult.failed}</div>
            <div className="text-xs text-[var(--tab-options-text)]">{chrome.i18n.getMessage('import_result_failed')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[var(--tab-message-warning-icon)]">{importResult.skipped}</div>
            <div className="text-xs text-[var(--tab-options-text)]">{chrome.i18n.getMessage('import_result_skipped')}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-[var(--tab-message-info-icon)]">{totalCount}</div>
            <div className="text-xs text-[var(--tab-options-text)]">{chrome.i18n.getMessage('import_result_total')}</div>
          </div>
        </div>

        {totalCount > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--tab-options-text)]">{chrome.i18n.getMessage('import_result_rate')}</span>
              <span className="font-medium text-[var(--tab-options-title)]">
                {Math.round((successCount / totalCount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-[var(--tab-options-progress-bar-bg)] rounded-full h-2">
              <div
                className="bg-[var(--tab-message-success-icon)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(successCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {importResult.errors && importResult.errors.length > 0 && (
          <div className="p-3 rounded-lg bg-[var(--tab-message-danger-bg)] border border-[var(--tab-message-danger-border)]">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-[var(--tab-message-danger-icon)]" />
              <span className="text-sm font-medium text-[var(--tab-message-danger-icon)]">
                {chrome.i18n.getMessage('import_result_errors')} ({importResult.errors.length})
              </span>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {importResult.errors.slice(0, 5).map((error, i) => {
                let errorText: string;
                if (typeof error === 'string') {
                  errorText = error;
                } else {
                  const title = error.item?.title || error.item?.url || 'Unknown';
                  const message = error.error || 'Unknown error';
                  errorText = `${title}: ${message}`;
                }
                return (
                  <div key={i} className="text-xs text-[var(--tab-message-danger-icon)]">
                    {errorText}
                  </div>
                );
              })}
              {importResult.errors.length > 5 && (
                <div className="text-xs text-[var(--tab-message-danger-icon)]">
                  ...{chrome.i18n.getMessage('import_preview_more', [(importResult.errors.length - 5).toString()])}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (isImporting && importProgress) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--tab-message-info-bg)] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[var(--tab-message-info-icon)] animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">{chrome.i18n.getMessage('import_importing')}</h3>
            <p className="text-sm text-[var(--tab-options-text)]">{importProgress.status}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--tab-options-text)]">{importProgress.status}</span>
            <span className="font-medium text-[var(--tab-options-title)]">{importProgress.current} / {importProgress.total}</span>
          </div>
          <div className="w-full bg-[var(--tab-options-progress-bar-bg)] rounded-full h-2">
            <div
              className="bg-[var(--tab-options-progress-bar-fill)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <p className="text-[var(--tab-options-text)]">{chrome.i18n.getMessage('import_start')}</p>
        <button
          onClick={() => onImport(bookmarks)}
          className="mt-4 px-6 py-3 text-sm font-medium text-[var(--tab-options-button-primary-text)] bg-[var(--tab-options-button-primary-bg)] rounded-md hover:bg-[var(--tab-options-button-primary-hover)]"
        >
          {chrome.i18n.getMessage('import_start')}
        </button>
      </div>
    </div>
  )
}
