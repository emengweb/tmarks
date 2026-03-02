/**
 * 导入功能组件 - 支持导入到 TMarks 或 NewTab
 */

import { useState } from 'react'
import { TMarksImport } from './import/TMarksImport'
import { NewTabImport } from './import/NewTabImport'
import { t } from '@/lib/i18n'

interface ImportSectionProps {
  formData: any
  setSuccessMessage: (msg: string) => void
  setError: (msg: string) => void
}

type ImportTarget = 'tmarks' | 'newtab'

export function ImportSection({ formData, setSuccessMessage, setError }: ImportSectionProps) {
  const [importTarget, setImportTarget] = useState<ImportTarget | null>(null)

  // 如果已选择目标，显示对应的导入组件
  if (importTarget === 'tmarks') {
    return (
      <TMarksImport
        formData={formData}
        setSuccessMessage={setSuccessMessage}
        setError={setError}
        onBack={() => setImportTarget(null)}
      />
    )
  }

  if (importTarget === 'newtab') {
    return (
      <NewTabImport
        setSuccessMessage={setSuccessMessage}
        setError={setError}
        onBack={() => setImportTarget(null)}
      />
    )
  }

  // 显示选择界面
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />
        
        <div className="p-6 pt-10">
          <h2 className="text-xl font-semibold text-[var(--tab-options-title)]">{t('import_select_target')}</h2>
          <p className="mt-2 text-sm text-[var(--tab-options-text)]">{t('import_select_target_desc')}</p>
          
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* 导入到 TMarks */}
            <button
              onClick={() => setImportTarget('tmarks')}
              className="group relative overflow-hidden rounded-xl border-2 border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] p-6 text-left transition-all hover:border-[var(--tab-options-button-primary-bg)] hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--tab-message-info-icon)] text-[var(--tab-message-info-icon-text)]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">{t('import_to_tmarks')}</h3>
                  <p className="mt-1 text-sm text-[var(--tab-options-text)]">{t('import_to_tmarks_desc')}</p>
                  <ul className="mt-3 space-y-1 text-xs text-[var(--tab-options-text-muted)]">
                    <li>• {t('import_tmarks_feature_1')}</li>
                    <li>• {t('import_tmarks_feature_2')}</li>
                    <li>• {t('import_tmarks_feature_3')}</li>
                  </ul>
                </div>
              </div>
            </button>

            {/* 导入到 NewTab */}
            <button
              onClick={() => setImportTarget('newtab')}
              className="group relative overflow-hidden rounded-xl border-2 border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] p-6 text-left transition-all hover:border-[var(--tab-options-button-primary-bg)] hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--tab-popup-section-purple-badge-bg)] text-[var(--tab-popup-section-purple-badge-text)]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">{t('import_to_newtab')}</h3>
                  <p className="mt-1 text-sm text-[var(--tab-options-text)]">{t('import_to_newtab_desc')}</p>
                  <ul className="mt-3 space-y-1 text-xs text-[var(--tab-options-text-muted)]">
                    <li>• {t('import_newtab_feature_1')}</li>
                    <li>• {t('import_newtab_feature_2')}</li>
                    <li>• {t('import_newtab_feature_3')}</li>
                  </ul>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
