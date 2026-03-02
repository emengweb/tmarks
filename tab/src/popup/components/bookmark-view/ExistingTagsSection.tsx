/**
 * 已有标签库区域组件
 */

import { t } from '@/lib/i18n';
import type { TagTheme } from '@/lib/utils/tagStyles';
import { getExistingTagClass } from '@/lib/utils/tagStyles';

interface ExistingTagsSectionProps {
  existingTags: Array<{ id: string; name: string; color: string; count: number }>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;
  isLoading: boolean;
}

export function ExistingTagsSection({
  existingTags,
  selectedTags,
  toggleTag,
  tagTheme,
  isLoading,
}: ExistingTagsSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-emerald-border)] bg-gradient-to-br from-[var(--tab-popup-section-emerald-from)] to-[var(--tab-popup-section-emerald-to)] p-3.5 shadow-lg">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--tab-popup-text)]">
            <svg className="h-4 w-4 text-[var(--tab-popup-section-emerald-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {t('tag_library')}
          </h2>
          <p className="mt-1 text-xs text-[var(--tab-popup-text-muted)]">{t('tag_library_desc')}</p>
        </div>
        <span className="rounded-full bg-[var(--tab-popup-section-emerald-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-emerald-badge-text)]">
          {existingTags.length}
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--tab-popup-border-strong)] scrollbar-track-transparent">
        {existingTags.length === 0 ? (
          <div className="flex items-center justify-center py-6">
            <p className="text-xs text-[var(--tab-popup-text-muted)]">
              {isLoading ? t('loading') : t('no_tags')}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {existingTags
              .sort((a, b) => b.count - a.count)
              .map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 active:scale-95 ${
                      getExistingTagClass(tagTheme, isSelected)
                    }`}
                  >
                    {tagTheme !== 'bw' && (
                      <span
                        className="mr-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color || 'var(--tab-message-success-icon)' }}
                      />
                    )}
                    <span className="truncate max-w-[110px]">{tag.name}</span>
                    {tag.count > 0 && (
                      <span className="ml-1 text-[10px] opacity-60">({tag.count})</span>
                    )}
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </section>
  );
}
