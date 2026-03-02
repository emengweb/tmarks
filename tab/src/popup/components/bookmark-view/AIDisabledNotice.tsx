/**
 * AI 禁用提示组件
 */

import { t } from '@/lib/i18n';

export function AIDisabledNotice() {
  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-amber-border)] bg-gradient-to-br from-[var(--tab-popup-section-amber-from)] to-[var(--tab-popup-section-amber-to)] p-3.5 shadow-lg">
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 flex-shrink-0 text-[var(--tab-popup-section-amber-icon)] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-[var(--tab-popup-section-amber-title)]">{t('popup_ai_disabled_title')}</p>
          <p className="mt-1 text-xs text-[var(--tab-popup-section-amber-text)]">{t('popup_ai_disabled_desc')}</p>
        </div>
      </div>
    </section>
  );
}
