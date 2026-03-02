/**
 * 编辑文本域组件
 */

import { t } from '@/lib/i18n';

interface EditTextareaProps {
  value: string;
  onChange: (v: string) => void;
  onApply: () => void;
  placeholder: string;
  disabled: boolean;
}

export function EditTextarea({ value, onChange, onApply, placeholder, disabled }: EditTextareaProps) {
  return (
    <div className="flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.ctrlKey) onApply();
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        rows={2}
        className="flex-1 rounded-xl border border-[var(--tab-popup-input-border)] bg-[var(--tab-popup-input-bg)] px-3 py-2 text-sm text-[var(--tab-popup-input-text)] placeholder:text-[var(--tab-popup-input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-popup-input-focus-ring)] focus:border-[var(--tab-popup-input-focus-border)] resize-none"
        autoFocus
      />
      <button
        onClick={onApply}
        disabled={disabled}
        aria-label={t('popup_apply')}
        className="rounded-xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-2 text-sm font-medium text-[var(--tab-popup-primary-text)] shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
      >
        {t('popup_apply')}
      </button>
    </div>
  );
}
