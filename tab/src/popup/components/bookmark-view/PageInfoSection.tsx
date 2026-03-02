/**
 * 页面信息区域组件
 */

import { t } from '@/lib/i18n';
import { PageInfoCard } from '@/components/PageInfoCard';
import { OptionButton } from './OptionButton';
import { EditInput } from './EditInput';
import { EditTextarea } from './EditTextarea';

interface PageInfoSectionProps {
  currentPage: {
    title: string;
    url: string;
    description?: string;
    thumbnail?: string;
    thumbnails?: string[];
    favicon?: string;
  };
  setCurrentPage: (page: any) => void;
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

export function PageInfoSection({
  currentPage,
  setCurrentPage,
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
}: PageInfoSectionProps) {
  return (
    <section className="rounded-xl border border-[var(--tab-popup-section-gray-border)] bg-[var(--tab-popup-section-gray-bg)] p-3.5 shadow-lg">
      <div className="mb-3 flex items-center justify-center gap-2">
        <OptionButton
          active={includeThumbnail}
          onClick={handleToggleThumbnail}
          disabled={!currentPage.thumbnail}
          title={includeThumbnail ? t('tooltip_include_thumbnail') : t('tooltip_no_thumbnail')}
          activeClass="bg-[var(--tab-popup-action-amber-bg)] text-[var(--tab-popup-action-amber-text)] hover:bg-[var(--tab-popup-action-amber-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </OptionButton>

        <OptionButton
          active={createSnapshot}
          onClick={() => setCreateSnapshot(!createSnapshot)}
          title={createSnapshot ? t('tooltip_create_snapshot') : t('tooltip_no_snapshot')}
          activeClass="bg-[var(--tab-popup-action-purple-bg)] text-[var(--tab-popup-action-purple-text)] hover:bg-[var(--tab-popup-action-purple-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </OptionButton>

        <OptionButton
          active={showTitleEdit}
          onClick={() => setShowTitleEdit(!showTitleEdit)}
          title={showTitleEdit ? t('tooltip_edit_title_collapse') : t('tooltip_edit_title_expand')}
          activeClass="bg-[var(--tab-popup-action-blue-bg)] text-[var(--tab-popup-action-blue-text)] hover:bg-[var(--tab-popup-action-blue-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </OptionButton>

        <OptionButton
          active={showDescEdit}
          onClick={() => setShowDescEdit(!showDescEdit)}
          title={showDescEdit ? t('tooltip_edit_desc_collapse') : t('tooltip_edit_desc_expand')}
          activeClass="bg-[var(--tab-popup-action-blue-bg)] text-[var(--tab-popup-action-blue-text)] hover:bg-[var(--tab-popup-action-blue-bg-hover)]"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
        </OptionButton>
      </div>

      <div className="mb-2.5 space-y-2">
        {showTitleEdit && (
          <EditInput
            value={titleOverride}
            onChange={setTitleOverride}
            onApply={handleApplyTitleOverride}
            placeholder={t('placeholder_custom_title')}
            disabled={!titleOverride.trim() || !currentPage}
          />
        )}

        {showDescEdit && (
          <EditTextarea
            value={descriptionOverride}
            onChange={setDescriptionOverride}
            onApply={handleApplyDescriptionOverride}
            placeholder={t('placeholder_custom_desc')}
            disabled={!currentPage}
          />
        )}
      </div>

      <PageInfoCard
        title={currentPage.title}
        url={currentPage.url}
        description={currentPage.description}
        thumbnail={includeThumbnail ? currentPage.thumbnail : undefined}
        thumbnails={includeThumbnail ? currentPage.thumbnails : undefined}
        favicon={currentPage.favicon}
        onThumbnailChange={(newThumbnail) => {
          setCurrentPage({ ...currentPage, thumbnail: newThumbnail });
        }}
      />
    </section>
  );
}
