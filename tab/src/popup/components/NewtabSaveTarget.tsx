/**
 * NewTab 保存位置固定栏
 */

import { t } from '@/lib/i18n';

interface NewtabSaveTargetProps {
  currentSaveTargetPath: string;
  hasUserSelectedFolder: boolean;
}

export function NewtabSaveTarget({ currentSaveTargetPath, hasUserSelectedFolder }: NewtabSaveTargetProps) {
  return (
    <div className="fixed top-[46px] left-0 right-0 z-20 border-b border-[var(--tab-popup-save-target-border)] bg-[var(--tab-popup-save-target-bg)] px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-[var(--tab-popup-save-target-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-sm font-semibold text-[var(--tab-popup-save-target-text)]">{currentSaveTargetPath}</span>
        </div>
        {hasUserSelectedFolder ? (
          <span className="rounded-full bg-[var(--tab-popup-save-target-badge-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--tab-popup-save-target-badge-text)]">
            {t('popup_selected')}
          </span>
        ) : (
          <span className="rounded-full bg-[var(--tab-popup-save-target-badge-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--tab-popup-text-muted)]">
            {t('popup_default')}
          </span>
        )}
      </div>
    </div>
  );
}
