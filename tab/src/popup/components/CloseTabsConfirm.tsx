/**
 * 关闭标签确认对话框组件
 */

import { t } from '@/lib/i18n';

interface CloseTabsConfirmProps {
  collectedCount: number;
  onCloseTabs: () => void;
  onKeepTabs: () => void;
}

export function CloseTabsConfirm({ collectedCount, onCloseTabs, onKeepTabs }: CloseTabsConfirmProps) {
  return (
    <div className="fixed top-[60px] left-0 right-0 z-40 px-4 pt-2 animate-in slide-in-from-top-5 fade-in duration-300">
      <section
        className="rounded-2xl border border-[color:var(--tab-message-success-border)] p-4 shadow-lg"
        style={{
          background: `linear-gradient(135deg, var(--tab-message-success-bg), var(--tab-message-success-icon-bg))`,
        }}
      >
        <div className="mb-3 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--tab-message-success-icon-bg)]">
            <svg className="h-5 w-5 text-[var(--tab-message-success-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--tab-text)]">{t('tab_collection_success')}</h3>
            <p className="mt-1 text-xs text-[var(--tab-text-muted)]">
              {t('tab_collection_collected_count', String(collectedCount))}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onKeepTabs}
            className="flex-1 rounded-xl border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-4 py-2 text-sm font-medium text-[var(--tab-text)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] active:scale-95"
          >
            {t('tab_collection_keep_tabs')}
          </button>
          <button
            onClick={onCloseTabs}
            className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
            style={{
              background: `linear-gradient(90deg, var(--tab-popup-success-from), var(--tab-popup-success-to))`,
              color: 'var(--tab-popup-success-text)',
            }}
          >
            {t('tab_collection_close_tabs')}
          </button>
        </div>
      </section>
    </div>
  );
}
