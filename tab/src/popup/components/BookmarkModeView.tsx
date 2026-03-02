/**
 * 书签模式视图组件
 */

import type { PageInfo, ExistingTag, TagSuggestion } from '@/types';
import type { TagTheme } from '@/lib/utils/tagStyles';
import { TagList } from '@/components/TagList';
import { PageInfoCard } from '@/components/PageInfoCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getExistingTagClass, getSelectedTagClass } from '@/lib/utils/tagStyles';
import { t } from '@/lib/i18n';

interface BookmarkModeViewProps {
  currentPage: PageInfo | null;
  recommendedTags: TagSuggestion[];
  existingTags: ExistingTag[];
  selectedTags: string[];
  isRecommending: boolean;
  isAIEnabled: boolean;
  isLoading: boolean;
  includeThumbnail: boolean;
  createSnapshot: boolean;
  showTitleEdit: boolean;
  showDescEdit: boolean;
  titleOverride: string;
  descriptionOverride: string;
  tagTheme: TagTheme;
  lastSaveDurationMs: number | null;
  onToggleTag: (tag: string) => void;
  onSetTitleOverride: (value: string) => void;
  onSetDescriptionOverride: (value: string) => void;
  onToggleThumbnail: () => void;
  onToggleSnapshot: () => void;
  onToggleTitleEdit: () => void;
  onToggleDescEdit: () => void;
  onApplyTitle: () => void;
  onApplyDescription: () => void;
  onThumbnailChange: (thumbnail: string) => void;
}

export function BookmarkModeView({
  currentPage,
  recommendedTags,
  existingTags,
  selectedTags,
  isRecommending,
  isAIEnabled,
  isLoading,
  includeThumbnail,
  createSnapshot,
  showTitleEdit,
  showDescEdit,
  titleOverride,
  descriptionOverride,
  tagTheme,
  lastSaveDurationMs,
  onToggleTag,
  onSetTitleOverride,
  onSetDescriptionOverride,
  onToggleThumbnail,
  onToggleSnapshot,
  onToggleTitleEdit,
  onToggleDescEdit,
  onApplyTitle,
  onApplyDescription,
  onThumbnailChange,
}: BookmarkModeViewProps) {
  return (
    <>
      {/* AI 推荐中 Loading */}
      {isRecommending && (
        <section className="flex items-center gap-3 rounded-xl border border-[var(--tab-popup-border)] bg-[var(--tab-popup-section-gray-bg)] p-3.5 text-sm text-[var(--tab-popup-text)] shadow-lg">
          <LoadingSpinner />
          <p>{t('popup_ai_analyzing')}</p>
        </section>
      )}

      {/* AI 未启用提示 */}
      {!isAIEnabled && !isRecommending && recommendedTags.length === 0 && (
        <section className="rounded-xl border border-[var(--tab-popup-section-amber-border)] bg-gradient-to-br from-[var(--tab-popup-section-amber-from)] to-[var(--tab-popup-section-amber-to)] p-3.5 shadow-lg">
          <div className="flex items-start gap-3">
            <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--tab-popup-section-amber-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[var(--tab-popup-section-amber-title)]">{t('popup_ai_disabled_title')}</p>
              <p className="mt-1 text-xs text-[var(--tab-popup-section-amber-text)]">{t('popup_ai_disabled_desc')}</p>
            </div>
          </div>
        </section>
      )}

      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <section className="rounded-xl border border-[var(--tab-popup-section-blue-border)] bg-gradient-to-br from-[var(--tab-popup-section-blue-from)] to-[var(--tab-popup-section-blue-to)] p-3.5 shadow-lg">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--tab-popup-text)]">{t('popup_selected_tags')}</p>
              <span className="text-[10px] text-[var(--tab-popup-text-muted)]">{t('popup_click_to_remove')}</span>
            </div>
            <span className="rounded-full bg-[var(--tab-popup-section-blue-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-blue-badge-text)]">{selectedTags.length}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tag) => (
              <button key={tag} onClick={() => onToggleTag(tag)} title={t('popup_click_to_remove')} className={getSelectedTagClass(tagTheme)}>
                <span className="max-w-[120px] truncate">{tag}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 页面信息与操作 */}
      {currentPage && (
        <section className="rounded-xl border border-[var(--tab-popup-section-gray-border)] bg-[var(--tab-popup-section-gray-bg)] p-3.5 shadow-lg">
          <div className="mb-3 flex items-center justify-center gap-2">
            <button type="button" onClick={onToggleThumbnail} disabled={!currentPage.thumbnail} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${includeThumbnail ? 'bg-[var(--tab-popup-action-amber-bg)] text-[var(--tab-popup-action-amber-text)] hover:bg-[var(--tab-popup-action-amber-bg-hover)]' : 'bg-[var(--tab-popup-action-neutral-bg)] text-[var(--tab-popup-action-neutral-text)] hover:bg-[var(--tab-popup-action-neutral-bg-hover)]'} ${!currentPage.thumbnail ? 'cursor-not-allowed opacity-40' : ''}`} title={includeThumbnail ? t('tooltip_include_thumbnail') : t('tooltip_no_thumbnail')}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
            <button type="button" onClick={onToggleSnapshot} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${createSnapshot ? 'bg-[var(--tab-popup-action-purple-bg)] text-[var(--tab-popup-action-purple-text)] hover:bg-[var(--tab-popup-action-purple-bg-hover)]' : 'bg-[var(--tab-popup-action-neutral-bg)] text-[var(--tab-popup-action-neutral-text)] hover:bg-[var(--tab-popup-action-neutral-bg-hover)]'}`} title={createSnapshot ? t('tooltip_create_snapshot') : t('tooltip_no_snapshot')}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button type="button" onClick={onToggleTitleEdit} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${showTitleEdit ? 'bg-[var(--tab-popup-action-blue-bg)] text-[var(--tab-popup-action-blue-text)] hover:bg-[var(--tab-popup-action-blue-bg-hover)]' : 'bg-[var(--tab-popup-action-neutral-bg)] text-[var(--tab-popup-action-neutral-text)] hover:bg-[var(--tab-popup-action-neutral-bg-hover)]'}`} title={showTitleEdit ? t('tooltip_edit_title_collapse') : t('tooltip_edit_title_expand')}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button type="button" onClick={onToggleDescEdit} className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${showDescEdit ? 'bg-[var(--tab-popup-action-blue-bg)] text-[var(--tab-popup-action-blue-text)] hover:bg-[var(--tab-popup-action-blue-bg-hover)]' : 'bg-[var(--tab-popup-action-neutral-bg)] text-[var(--tab-popup-action-neutral-text)] hover:bg-[var(--tab-popup-action-neutral-bg-hover)]'}`} title={showDescEdit ? t('tooltip_edit_desc_collapse') : t('tooltip_edit_desc_expand')}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
            </button>
          </div>
          <div className="mb-2.5 space-y-2">
            {showTitleEdit && (
              <div className="animate-in slide-in-from-top-2 fade-in flex gap-2 duration-200">
                <input type="text" value={titleOverride} onChange={(e) => onSetTitleOverride(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onApplyTitle(); }} placeholder={t('placeholder_custom_title')} className="flex-1 rounded-xl border border-[var(--tab-popup-input-border)] bg-[var(--tab-popup-input-bg)] px-3 py-2 text-sm text-[var(--tab-popup-input-text)] placeholder:text-[var(--tab-popup-input-placeholder)] focus:border-[var(--tab-popup-input-focus-border)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-popup-input-focus-ring)]" autoFocus />
                <button onClick={onApplyTitle} disabled={!titleOverride.trim() || !currentPage} className="rounded-xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-2 text-sm font-medium text-[var(--tab-popup-primary-text)] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">{t('popup_apply')}</button>
              </div>
            )}
            {showDescEdit && (
              <div className="animate-in slide-in-from-top-2 fade-in flex gap-2 duration-200">
                <textarea value={descriptionOverride} onChange={(e) => onSetDescriptionOverride(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) onApplyDescription(); }} placeholder={t('placeholder_custom_desc')} rows={2} className="flex-1 resize-none rounded-xl border border-[var(--tab-popup-input-border)] bg-[var(--tab-popup-input-bg)] px-3 py-2 text-sm text-[var(--tab-popup-input-text)] placeholder:text-[var(--tab-popup-input-placeholder)] focus:border-[var(--tab-popup-input-focus-border)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-popup-input-focus-ring)]" autoFocus />
                <button onClick={onApplyDescription} disabled={!currentPage} className="rounded-xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-2 text-sm font-medium text-[var(--tab-popup-primary-text)] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">{t('popup_apply')}</button>
              </div>
            )}
          </div>
          <PageInfoCard title={currentPage.title} url={currentPage.url} description={currentPage.description} thumbnail={includeThumbnail ? currentPage.thumbnail : undefined} thumbnails={includeThumbnail ? currentPage.thumbnails : undefined} favicon={currentPage.favicon} onThumbnailChange={onThumbnailChange} />
        </section>
      )}

      {/* AI 推荐标签 */}
      {recommendedTags.length > 0 && (
        <section className="rounded-xl border border-[var(--tab-popup-section-purple-border)] bg-gradient-to-br from-[var(--tab-popup-section-purple-from)] to-[var(--tab-popup-section-purple-to)] p-3.5 shadow-lg">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--tab-popup-text)]">{t('ai_recommend_title')}</h2>
              <p className="mt-1 text-xs text-[var(--tab-popup-text-muted)]">{t('ai_recommend_desc')}</p>
            </div>
            <span className="rounded-full bg-[var(--tab-popup-section-purple-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-purple-badge-text)]">{recommendedTags.length}</span>
          </div>
          <TagList tags={recommendedTags} selectedTags={selectedTags} onToggle={onToggleTag} theme={tagTheme} />
        </section>
      )}

      {/* 标签库 */}
      <section className="rounded-xl border border-[var(--tab-popup-section-emerald-border)] bg-gradient-to-br from-[var(--tab-popup-section-emerald-from)] to-[var(--tab-popup-section-emerald-to)] p-3.5 shadow-lg">
        <div className="mb-2.5 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--tab-popup-text)]">
              <svg className="h-4 w-4 text-[var(--tab-popup-section-emerald-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              {t('tag_library')}
            </h2>
            <p className="mt-1 text-xs text-[var(--tab-popup-text-muted)]">{t('tag_library_desc')}</p>
          </div>
          <span className="rounded-full bg-[var(--tab-popup-section-emerald-badge-bg)] px-2 py-0.5 text-xs font-medium text-[var(--tab-popup-section-emerald-badge-text)]">{existingTags.length}</span>
        </div>
        <div className="scrollbar-thin scrollbar-thumb-[var(--tab-popup-border-strong)] scrollbar-track-transparent max-h-48 overflow-y-auto pr-1">
          {existingTags.length === 0 ? (
            <div className="flex items-center justify-center py-6"><p className="text-xs text-[var(--tab-popup-text-muted)]">{isLoading ? t('loading') : t('no_tags')}</p></div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {existingTags.sort((a, b) => b.count - a.count).map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button key={tag.id} onClick={() => onToggleTag(tag.name)} className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 active:scale-95 ${getExistingTagClass(tagTheme, isSelected)}`}>
                    {tagTheme !== 'bw' && <span className="mr-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: tag.color || 'var(--tab-message-success-icon)' }} />}
                    <span className="max-w-[110px] truncate">{tag.name}</span>
                    {tag.count > 0 && <span className="ml-1 text-[10px] opacity-60">({tag.count})</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 保存耗时 */}
      {lastSaveDurationMs !== null && (
        <section className="rounded-xl border border-[var(--tab-popup-section-gray-border)] bg-[var(--tab-popup-section-gray-bg)] p-2.5 text-xs text-[var(--tab-popup-text-muted)] shadow-sm">
          {t('last_save_duration', (lastSaveDurationMs / 1000).toFixed(2))}
        </section>
      )}
    </>
  );
}
