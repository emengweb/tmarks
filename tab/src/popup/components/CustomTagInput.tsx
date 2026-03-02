/**
 * 自定义标签输入框（Footer）
 */

import { t } from '@/lib/i18n';

interface CustomTagInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function CustomTagInput({ value, onChange, onAdd, onKeyPress }: CustomTagInputProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-20 rounded-t-2xl border-t border-[var(--tab-popup-footer-border)] bg-[var(--tab-popup-footer-bg)] px-3 pt-2 pb-2.5 shadow-sm">
      <div className="flex items-center gap-2">
        <svg className="h-4 w-4 flex-shrink-0 text-[var(--tab-popup-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={t('placeholder_add_tag')}
          aria-label={t('placeholder_add_tag')}
          className="flex-1 rounded-xl border border-[var(--tab-popup-input-border)] bg-[var(--tab-popup-input-bg)] px-3 py-1.5 text-sm text-[var(--tab-popup-input-text)] placeholder:text-[var(--tab-popup-input-placeholder)] focus:border-[var(--tab-popup-input-focus-border)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-popup-input-focus-ring)]"
        />
        <button
          onClick={onAdd}
          disabled={!value.trim()}
          aria-label={t('add_tag')}
          className="rounded-xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-1.5 text-sm font-medium text-[var(--tab-popup-primary-text)] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
        >
          {t('add_tag')}
        </button>
      </div>
    </footer>
  );
}
