/**
 * 书签保存视图主组件
 */

import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { TagTheme } from '@/lib/utils/tagStyles';
import { AIDisabledNotice } from './AIDisabledNotice';
import { SelectedTagsSection } from './SelectedTagsSection';
import { PageInfoSection } from './PageInfoSection';
import { RecommendedTagsSection } from './RecommendedTagsSection';
import { ExistingTagsSection } from './ExistingTagsSection';
import { t } from '@/lib/i18n';

interface BookmarkViewProps {
  currentPage: {
    title: string;
    url: string;
    description?: string;
    thumbnail?: string;
    thumbnails?: string[];
    favicon?: string;
  } | null;
  setCurrentPage: (page: any) => void;
  recommendedTags: Array<{ name: string; isNew?: boolean; confidence?: number }>;
  existingTags: Array<{ id: string; name: string; color: string; count: number }>;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  tagTheme: TagTheme;
  isLoading: boolean;
  isRecommending: boolean;
  isAIEnabled: boolean;
  includeThumbnail: boolean;
  handleToggleThumbnail: () => void;
  createSnapshot: boolean;
  setCreateSnapshot: (v: boolean) => void;
  showTitleEdit: boolean;
  setShowTitleEdit: (v: boolean) => void;
  showDescEdit: boolean;
  setShowDescEdit: (v: boolean) => void;
  titleOverride: string;
  setTitleOverride: (v: string) => void;
  descriptionOverride: string;
  setDescriptionOverride: (v: string) => void;
  handleApplyTitleOverride: () => void;
  handleApplyDescriptionOverride: () => void;
}

export function BookmarkView(props: BookmarkViewProps) {
  const {
    currentPage,
    setCurrentPage,
    recommendedTags,
    existingTags,
    selectedTags,
    toggleTag,
    tagTheme,
    isLoading,
    isRecommending,
    isAIEnabled,
    includeThumbnail,
    handleToggleThumbnail,
    createSnapshot,
    setCreateSnapshot,
    showTitleEdit,
    setShowTitleEdit,
    showDescEdit,
    setShowDescEdit,
    titleOverride,
    setTitleOverride,
    descriptionOverride,
    setDescriptionOverride,
    handleApplyTitleOverride,
    handleApplyDescriptionOverride,
  } = props;

  return (
    <>
      {isRecommending && (
        <section className="flex items-center gap-3 rounded-xl border border-[var(--tab-popup-border)] bg-[var(--tab-popup-section-gray-bg)] p-3.5 text-sm text-[var(--tab-popup-text)] shadow-lg">
          <LoadingSpinner />
          <p>{t('popup_ai_analyzing')}</p>
        </section>
      )}

      {!isAIEnabled && !isRecommending && recommendedTags.length === 0 && <AIDisabledNotice />}

      {selectedTags.length > 0 && (
        <SelectedTagsSection selectedTags={selectedTags} toggleTag={toggleTag} tagTheme={tagTheme} />
      )}

      {currentPage && (
        <PageInfoSection
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          includeThumbnail={includeThumbnail}
          handleToggleThumbnail={handleToggleThumbnail}
          createSnapshot={createSnapshot}
          setCreateSnapshot={setCreateSnapshot}
          showTitleEdit={showTitleEdit}
          setShowTitleEdit={setShowTitleEdit}
          showDescEdit={showDescEdit}
          setShowDescEdit={setShowDescEdit}
          titleOverride={titleOverride}
          setTitleOverride={setTitleOverride}
          descriptionOverride={descriptionOverride}
          setDescriptionOverride={setDescriptionOverride}
          handleApplyTitleOverride={handleApplyTitleOverride}
          handleApplyDescriptionOverride={handleApplyDescriptionOverride}
        />
      )}

      {recommendedTags.length > 0 && (
        <RecommendedTagsSection
          recommendedTags={recommendedTags}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          tagTheme={tagTheme}
        />
      )}

      <ExistingTagsSection
        existingTags={existingTags}
        selectedTags={selectedTags}
        toggleTag={toggleTag}
        tagTheme={tagTheme}
        isLoading={isLoading}
      />
    </>
  );
}
