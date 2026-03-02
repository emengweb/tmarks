/**
 * 书签信息展示组件
 */

import { t } from '@/lib/i18n';
import type { ExistingBookmarkData } from '@/lib/services/bookmark-api';

interface BookmarkInfoProps {
  bookmark: ExistingBookmarkData;
  tmarksUrl: string;
}

export function BookmarkInfo({ bookmark, tmarksUrl }: BookmarkInfoProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-[color:var(--tab-surface-muted)] rounded-lg p-4 space-y-3">
      <div>
        <div className="text-xs text-[var(--tab-text-muted)] mb-1">{t('label_title')}</div>
        <div className="text-sm font-medium text-[var(--tab-text)]">
          {bookmark.title}
        </div>
      </div>

      <div>
        <div className="text-xs text-[var(--tab-text-muted)] mb-1">{t('label_created_at')}</div>
        <div className="text-sm text-[var(--tab-text)]">
          {formatDate(bookmark.created_at)}
        </div>
      </div>

      {/* Existing description */}
      {bookmark.description && (
        <div>
          <div className="text-xs text-[var(--tab-text-muted)] mb-1">{t('label_description')}</div>
          <div className="text-sm text-[var(--tab-text)]">
            {bookmark.description}
          </div>
        </div>
      )}

      {/* Existing tags */}
      {bookmark.tags.length > 0 && (
        <div>
          <div className="text-xs text-[var(--tab-text-muted)] mb-2">{t('label_existing_tags')}</div>
          <div className="flex flex-wrap gap-2">
            {bookmark.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[color:var(--tab-message-info-icon-bg)] text-[var(--tab-message-info-icon)]"
                style={
                  tag.color
                    ? {
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                      }
                    : undefined
                }
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Snapshot info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-[var(--tab-text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[var(--tab-text)]">
            {bookmark.has_snapshot
              ? t('snapshot_count', String(bookmark.snapshot_count || 0))
              : t('no_snapshot')}
          </span>
        </div>
        {bookmark.has_snapshot && tmarksUrl && (
          <a
            href={`${tmarksUrl}/bookmarks/${bookmark.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[var(--tab-message-info-icon)] hover:opacity-90 hover:bg-[color:var(--tab-message-info-icon-bg)] rounded transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {t('view_snapshot')}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
