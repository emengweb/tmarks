/**
 * 书签已存在对话框组件（协调器）
 */

import { X } from 'lucide-react';
import { LoadingMessage } from '@/components/LoadingMessage';
import { t } from '@/lib/i18n';
import type { ExistingBookmarkData } from '@/lib/services/bookmark-api';
import { BookmarkInfo } from './bookmark-exists/BookmarkInfo';
import { ActionOptions } from './bookmark-exists/ActionOptions';
import { useBookmarkExistsState } from './bookmark-exists/useBookmarkExistsState';
import { useBookmarkExistsHandlers } from './bookmark-exists/useBookmarkExistsHandlers';

interface BookmarkExistsDialogProps {
  bookmark: ExistingBookmarkData;
  newTags: string[];
  onUpdateTags: (tags: string[]) => Promise<void>;
  onUpdateDescription: (description: string) => Promise<void>;
  onCreateSnapshot: () => Promise<void>;
  onCancel: () => void;
}

export function BookmarkExistsDialog({
  bookmark,
  newTags,
  onUpdateTags,
  onUpdateDescription,
  onCreateSnapshot,
  onCancel,
}: BookmarkExistsDialogProps) {
  const state = useBookmarkExistsState(bookmark);
  const handlers = useBookmarkExistsHandlers({
    selectedAction: state.selectedAction,
    descriptionInput: state.descriptionInput,
    newTags,
    setIsProcessing: state.setIsProcessing,
    setProcessingMessage: state.setProcessingMessage,
    setIsVisible: state.setIsVisible,
    onUpdateTags,
    onUpdateDescription,
    onCreateSnapshot,
    onCancel,
  });

  const existingTagNames = bookmark.tags.map(t => t.name);
  const newTagsToAdd = newTags.filter(tag => !existingTagNames.includes(tag));
  const hasNewTags = newTagsToAdd.length > 0;

  return (
    <div 
      className={`fixed inset-0 z-40 flex items-center justify-center backdrop-blur-sm transition-all duration-150 ${
        state.isVisible ? 'bg-[color:var(--tab-overlay)] opacity-100' : 'bg-transparent opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handlers.handleClose();
      }}
    >
      {/* Loading Message */}
      {state.isProcessing && (
        <div className="absolute top-4 left-0 right-0 px-4 z-50">
          <LoadingMessage message={state.processingMessage} />
        </div>
      )}
      
      <div 
        ref={state.dialogRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`bg-[color:var(--tab-surface)] rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto transition-all duration-150 ${
          state.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[color:var(--tab-surface)] border-b border-[color:var(--tab-border)] px-6 py-4 rounded-t-xl">
          <div className="flex items-start gap-3">
            <div className="bg-[color:var(--tab-message-warning-icon-bg)] rounded-full p-2 flex-shrink-0">
              <svg
                className="w-6 h-6 text-[var(--tab-message-warning-icon)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 id="dialog-title" className="text-lg font-semibold text-[var(--tab-text)]">
                {t('bookmark_exists_title')}
              </h3>
              <p className="text-sm text-[var(--tab-text-muted)] mt-1">
                {t('bookmark_exists_desc')}
              </p>
            </div>
            <button
              onClick={handlers.handleClose}
              disabled={state.isProcessing}
              className="p-1.5 rounded-lg hover:bg-[color:var(--tab-surface-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('options_close')}
            >
              <X className="w-5 h-5 text-[var(--tab-text-muted)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Existing bookmark info */}
          <BookmarkInfo bookmark={bookmark} tmarksUrl={state.tmarksUrl} />

          {/* New tags hint */}
          {hasNewTags && (
            <div className="bg-[color:var(--tab-message-success-bg)] border border-[color:var(--tab-message-success-border)] rounded-lg p-3">
              <div className="text-xs text-[var(--tab-message-success-icon)] mb-2">
                {t('label_new_tags_detected')}
              </div>
              <div className="flex flex-wrap gap-2">
                {newTagsToAdd.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[color:var(--tab-message-success-icon-bg)] text-[var(--tab-message-success-icon)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action options */}
          <ActionOptions
            selectedAction={state.selectedAction}
            hasNewTags={hasNewTags}
            descriptionInput={state.descriptionInput}
            onActionChange={state.setSelectedAction}
            onDescriptionChange={state.setDescriptionInput}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[color:var(--tab-surface-muted)] border-t border-[color:var(--tab-border)] px-6 py-4 rounded-b-xl flex gap-3">
          <button
            onClick={handlers.handleClose}
            disabled={state.isProcessing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--tab-text)] bg-[color:var(--tab-surface)] border border-[color:var(--tab-border-strong)] rounded-lg hover:bg-[color:var(--tab-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('btn_cancel')}
          </button>
          <button
            onClick={handlers.handleConfirm}
            disabled={!state.selectedAction || state.isProcessing}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--tab-popup-primary-text)] bg-[var(--tab-popup-primary-from)] rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {state.isProcessing ? t('btn_processing') : t('btn_confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
