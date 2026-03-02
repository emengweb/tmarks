/**
 * 已选标签区域组件
 */

import { t } from '@/lib/i18n';
import type { TagTheme } from '@/lib/utils/tagStyles';
import { getSelectedTagClass } from '@/lib/utils/tagStyles';

interface SelectedTagsSectionProps {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;
}

export function SelectedTagsSection({ selectedTags, toggleTag, tagTheme }: SelectedTagsSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-blue-border)] bg-gradient-to-br from-[var(--tab-popup-section-blue-from)] to-[var(--tab-popup-section-blue-to)] p-3.5 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[var(--tab-popup-text)]">{t('popup_selected_tags')}</p>
          <span className="text-[10px] text-[var(--tab-popup-text-muted)]">{t('popup_click_to_remove')}</span>
        </div>
        <span className="rounded-full bg-[var(--tab-popup-section-blue-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-blue-badge-text)]">
          {selectedTags.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {selectedTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            title={t('tooltip_click_remove_tag')}
            className={getSelectedTagClass(tagTheme)}
          >
            <span className="truncate max-w-[120px]">{tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
