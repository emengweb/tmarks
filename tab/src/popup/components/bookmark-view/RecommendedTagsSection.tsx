/**
 * AI 推荐标签区域组件
 */

import { t } from '@/lib/i18n';
import { TagList } from '@/components/TagList';
import type { TagTheme } from '@/lib/utils/tagStyles';

interface RecommendedTagsSectionProps {
  recommendedTags: Array<{ name: string; isNew?: boolean; confidence?: number }>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;
}

export function RecommendedTagsSection({
  recommendedTags,
  selectedTags,
  toggleTag,
  tagTheme,
}: RecommendedTagsSectionProps) {
  if (!Array.isArray(recommendedTags)) {
    return null;
  }

  const tags = recommendedTags.map((t) => ({
    name: t.name,
    isNew: t.isNew ?? false,
    confidence: t.confidence ?? 0.5,
  }));

  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-purple-border)] bg-gradient-to-br from-[var(--tab-popup-section-purple-from)] to-[var(--tab-popup-section-purple-to)] p-3.5 shadow-lg">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--tab-popup-text)]">
            {t('ai_recommend_title')}
          </h2>
          <p className="mt-1 text-xs text-[var(--tab-popup-text-muted)]">{t('ai_recommend_desc')}</p>
        </div>
        <span className="rounded-full bg-[var(--tab-popup-section-purple-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-purple-badge-text)]">
          {recommendedTags.length}
        </span>
      </div>
      <TagList tags={tags} selectedTags={selectedTags} onToggle={toggleTag} theme={tagTheme} />
    </section>
  );
}
