/**
 * Popup 主组件（协调器）
 */

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { ErrorMessage } from '@/components/ErrorMessage';
import { SuccessMessage } from '@/components/SuccessMessage';
import { LoadingMessage } from '@/components/LoadingMessage';
import { BookmarkExistsDialog } from '@/components/BookmarkExistsDialog';
import { ModeSelector } from './ModeSelector';
import { TabCollectionView } from './TabCollectionView';
import { NewtabModeView } from './components/NewtabModeView';
import { BookmarkModeView } from './components/BookmarkModeView';
import { OnboardingView } from './components/OnboardingView';
import { useNewtabState } from './hooks/useNewtabState';
import { usePopupState, useTitleSync, useDescriptionSync } from './hooks/usePopupState';
import { useBookmarkHandlers } from './hooks/useBookmarkHandlers';
import { useNewtabHandlers } from './hooks/useNewtabHandlers';
import { type TagTheme } from '@/lib/utils/tagStyles';
import { applyTheme, applyThemeStyle } from '@/lib/utils/themeManager';
import { t } from '@/lib/i18n';

export function Popup() {
  const {
    currentPage, recommendedTags, existingTags, selectedTags,
    isLoading, isSaving, isRecommending, error, successMessage, loadingMessage,
    existingBookmark, config, loadConfig, loadExistingTags, extractPageInfo,
    recommendTags, saveBookmark, setError, setSuccessMessage, setLoadingMessage,
    toggleTag, addCustomTag, setCurrentPage, includeThumbnail, setIncludeThumbnail,
    createSnapshot, setCreateSnapshot, setExistingBookmark,
    updateExistingBookmarkTags, updateExistingBookmarkDescription,
    createSnapshotForBookmark, lastRecommendationSource, lastSaveDurationMs
  } = useAppStore();

  const newtabState = useNewtabState(setError, setSuccessMessage);
  const popupState = usePopupState();

  useTitleSync(currentPage?.title, popupState.setTitleOverride);
  useDescriptionSync(currentPage?.description, popupState.setDescriptionOverride);

  const bookmarkHandlers = useBookmarkHandlers({
    currentPage,
    selectedTags,
    titleOverride: popupState.titleOverride,
    descriptionOverride: popupState.descriptionOverride,
    includeThumbnail,
    createSnapshot,
    setError,
    setCurrentPage,
    setTitleOverride: popupState.setTitleOverride,
    setDescriptionOverride: popupState.setDescriptionOverride,
    setIncludeThumbnail,
    setCreateSnapshot,
    saveBookmark,
    addCustomTag,
    toggleTag,
  });

  const newtabHandlers = useNewtabHandlers({
    currentPage,
    config,
    titleOverride: popupState.titleOverride,
    newtabFoldersLoaded: newtabState.newtabFoldersLoaded,
    newtabFolders: newtabState.newtabFolders,
    newtabSuggestions: newtabState.newtabSuggestions,
    currentNewtabFolderId: newtabState.currentNewtabFolderId,
    newtabRootId: newtabState.newtabRootId,
    setError,
    setSuccessMessage,
    setLoadingMessage,
  });

  const tagTheme: TagTheme = (config?.preferences?.tagTheme ?? 'classic') as TagTheme;

  useEffect(() => {
    loadConfig();
    loadExistingTags();
  }, []);

  useEffect(() => {
    applyTheme(config?.preferences?.theme ?? 'auto');
  }, [config?.preferences?.theme]);

  useEffect(() => {
    applyThemeStyle(config?.preferences?.themeStyle ?? 'tmarks');
  }, [config?.preferences?.themeStyle]);

  const isConfigured = Boolean(config && config.bookmarkSite.apiKey);
  const isAIEnabled = Boolean(
    config && config.preferences.enableAI && config.aiConfig.apiKeys[config.aiConfig.provider]
  );

  // Initialize bookmark mode
  useEffect(() => {
    if (!config || popupState.initialized || popupState.viewMode !== 'bookmark') return;
    const init = async () => {
      if (!isConfigured) { popupState.setInitialized(true); return; }
      try {
        await extractPageInfo();
        const shouldUseAI = config.preferences.enableAI && Boolean(config.aiConfig.apiKeys[config.aiConfig.provider]);
        if (shouldUseAI) await recommendTags();
        popupState.setInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error_init_failed'));
        popupState.setInitialized(true);
      }
    };
    init();
  }, [config, popupState.viewMode]);

  // Initialize newtab mode
  useEffect(() => {
    if (!config || popupState.initialized || popupState.viewMode !== 'newtab') return;
    const init = async () => {
      try {
        await extractPageInfo();
        await newtabState.loadNewtabFolders();
        
        const shouldUseAI = config.preferences.enableNewtabAI && Boolean(config.aiConfig.apiKeys[config.aiConfig.provider]);
        if (shouldUseAI) {
          const page = useAppStore.getState().currentPage;
          if (page) {
            await newtabState.handleRecommendNewtabFolder(page);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error_init_failed'));
      } finally {
        popupState.setInitialized(true);
      }
    };
    init();
  }, [config, popupState.viewMode]);

  const openOptions = () => chrome.runtime.openOptionsPage();
  const handleSelectBookmark = () => { popupState.setViewMode('bookmark'); popupState.setInitialized(false); };
  const handleSelectTabCollection = () => popupState.setViewMode('tabCollection');
  const handleSelectNewTab = () => { popupState.setViewMode('newtab'); popupState.setInitialized(false); };
  const handleBackToSelector = () => popupState.setViewMode('selector');

  // Mode selector view
  if (popupState.viewMode === 'selector') {
    return (
      <ModeSelector
        onSelectBookmark={handleSelectBookmark}
        onSelectNewTab={handleSelectNewTab}
        onSelectTabCollection={handleSelectTabCollection}
        onOpenOptions={openOptions}
      />
    );
  }

  // Tab collection view
  if (popupState.viewMode === 'tabCollection') {
    if (!config) return <div>{t('loading')}</div>;
    return <TabCollectionView config={config.bookmarkSite} onBack={handleBackToSelector} />;
  }

  // Onboarding view (not configured)
  if (popupState.initialized && !isConfigured) {
    return <OnboardingView onOpenOptions={openOptions} />;
  }

  // Main view (bookmark or newtab mode)
  return (
    <div className="relative h-[80vh] min-h-[620px] w-[380px] overflow-hidden rounded-2xl bg-[var(--tab-popup-surface)] text-[var(--tab-popup-text)] shadow-2xl">
      {/* Notifications */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 space-y-2 px-4 pt-2">
        {error && <div className="pointer-events-auto"><ErrorMessage message={error} onDismiss={() => setError(null)} onRetry={!isLoading && lastRecommendationSource === 'fallback' ? recommendTags : undefined} /></div>}
        {loadingMessage && <div className="pointer-events-auto"><LoadingMessage message={loadingMessage} /></div>}
        {successMessage && <div className="pointer-events-auto"><SuccessMessage message={successMessage} /></div>}
      </div>

      <div className="relative flex h-full flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-20 border-b border-[var(--tab-popup-border)] bg-[var(--tab-popup-surface)] px-3 pt-2 pb-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={handleBackToSelector} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--tab-popup-text-muted)] transition-all hover:bg-[var(--tab-popup-action-neutral-bg)] active:scale-95" title={t('popup_back')}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {popupState.viewMode === 'bookmark' && isAIEnabled && <span className="inline-flex flex-shrink-0 items-center rounded-full bg-[var(--tab-popup-badge-blue-bg)] px-2 py-1 text-[10px] font-medium text-[var(--tab-popup-badge-blue-text)]">{t('popup_recommend_count', String(recommendedTags.length))}</span>}
            {popupState.viewMode === 'bookmark' && !isAIEnabled && <span className="inline-flex flex-shrink-0 items-center rounded-full bg-[var(--tab-popup-badge-amber-bg)] px-2 py-1 text-[10px] font-medium text-[var(--tab-popup-badge-amber-text)]">{t('popup_ai_off')}</span>}
            {popupState.viewMode === 'bookmark' && (
              <>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-[var(--tab-popup-badge-indigo-bg)] px-2 py-1 text-[10px] font-medium text-[var(--tab-popup-badge-indigo-text)]">{t('popup_selected_count', String(selectedTags.length))}</span>
                <span className="inline-flex flex-shrink-0 items-center rounded-full bg-[var(--tab-popup-badge-purple-bg)] px-2 py-1 text-[10px] font-medium text-[var(--tab-popup-badge-purple-text)]">{t('popup_library_count', String(existingTags.length))}</span>
              </>
            )}
            <div className="ml-auto flex gap-1.5">
              <button onClick={() => window.close()} className="rounded-lg border border-[var(--tab-popup-border-strong)] bg-[var(--tab-popup-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--tab-popup-text)] transition-all hover:bg-[var(--tab-popup-action-neutral-bg)] active:scale-95">{t('btn_cancel')}</button>
              {popupState.viewMode === 'bookmark' ? (
                <button onClick={bookmarkHandlers.handleSave} disabled={isSaving || selectedTags.length === 0} className="rounded-lg bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-1.5 text-[11px] font-semibold text-[var(--tab-popup-primary-text)] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">
                  {isSaving ? <span className="flex items-center gap-1"><svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>{t('popup_saving')}</span> : t('popup_save_bookmark')}
                </button>
              ) : (
                <button onClick={newtabHandlers.handleSaveToNewTab} disabled={isSaving || !currentPage?.url} className="rounded-lg bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-1.5 text-[11px] font-semibold text-[var(--tab-popup-primary-text)] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">{t('popup_save_to_newtab')}</button>
              )}
            </div>
          </div>
        </header>

        {/* NewTab 保存位置固定栏 */}
        {popupState.viewMode === 'newtab' && (
          <div className="fixed top-[46px] left-0 right-0 z-20 border-b border-[var(--tab-popup-save-target-border)] bg-[var(--tab-popup-save-target-bg)] px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[var(--tab-popup-save-target-icon)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span className="text-sm font-semibold text-[var(--tab-popup-save-target-text)]">{newtabHandlers.currentSaveTargetPath}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {newtabHandlers.hasUserSelectedFolder ? (
                  <span className="rounded-full bg-[var(--tab-popup-save-target-badge-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--tab-popup-save-target-badge-text)]">{t('popup_selected')}</span>
                ) : newtabState.newtabSuggestions.length > 0 ? (
                  <span className="rounded-full bg-[var(--tab-message-info-icon)] px-2 py-0.5 text-[10px] font-medium text-white">AI</span>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={`relative flex-1 overflow-hidden bg-[var(--tab-popup-bg)] px-4 ${popupState.viewMode === 'newtab' ? 'flex flex-col pt-[90px] pb-4' : 'space-y-2.5 overflow-y-auto pt-[60px] pb-[70px]'}`}>
          {/* NewTab Mode */}
          {popupState.viewMode === 'newtab' && (
            <NewtabModeView
              currentPage={currentPage}
              titleOverride={popupState.titleOverride}
              setTitleOverride={popupState.setTitleOverride}
              newtabFoldersLoadError={newtabState.newtabFoldersLoadError}
              enterNewtabFolder={newtabState.enterNewtabFolder}
              loadNewtabFolders={newtabState.loadNewtabFolders}
              newtabSuggestions={newtabState.newtabSuggestions}
              newtabFolders={newtabState.newtabFolders}
              currentNewtabFolderId={newtabState.currentNewtabFolderId}
              newtabRootId={newtabState.newtabRootId}
              isAIEnabled={Boolean(config && config.preferences.enableNewtabAI && config.aiConfig.apiKeys[config.aiConfig.provider])}
              isRecommending={newtabState.isNewtabRecommending}
            />
          )}

          {/* Bookmark Mode */}
          {popupState.viewMode === 'bookmark' && (
            <BookmarkModeView
              currentPage={currentPage}
              recommendedTags={recommendedTags}
              existingTags={existingTags}
              selectedTags={selectedTags}
              isRecommending={isRecommending}
              isAIEnabled={isAIEnabled}
              isLoading={isLoading}
              includeThumbnail={includeThumbnail}
              createSnapshot={createSnapshot}
              showTitleEdit={popupState.showTitleEdit}
              showDescEdit={popupState.showDescEdit}
              titleOverride={popupState.titleOverride}
              descriptionOverride={popupState.descriptionOverride}
              tagTheme={tagTheme}
              lastSaveDurationMs={lastSaveDurationMs}
              onToggleTag={toggleTag}
              onSetTitleOverride={popupState.setTitleOverride}
              onSetDescriptionOverride={popupState.setDescriptionOverride}
              onToggleThumbnail={bookmarkHandlers.handleToggleThumbnail}
              onToggleSnapshot={bookmarkHandlers.handleToggleSnapshot}
              onToggleTitleEdit={() => popupState.setShowTitleEdit(!popupState.showTitleEdit)}
              onToggleDescEdit={() => popupState.setShowDescEdit(!popupState.showDescEdit)}
              onApplyTitle={bookmarkHandlers.handleApplyTitleOverride}
              onApplyDescription={bookmarkHandlers.handleApplyDescriptionOverride}
              onThumbnailChange={bookmarkHandlers.handleThumbnailChange}
            />
          )}
        </main>

        {/* Footer - Custom Tag Input (only for bookmark mode) */}
        {popupState.viewMode === 'bookmark' && (
          <footer className="fixed bottom-0 left-0 right-0 z-20 rounded-t-2xl border-t border-[var(--tab-popup-footer-border)] bg-[var(--tab-popup-footer-bg)] px-3 pt-2 pb-2.5 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 flex-shrink-0 text-[var(--tab-popup-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <input type="text" value={popupState.customTagInput} onChange={(e) => popupState.setCustomTagInput(e.target.value)} onKeyPress={(e) => bookmarkHandlers.handleKeyPress(e, popupState.customTagInput, popupState.setCustomTagInput)} placeholder={t('placeholder_add_tag')} className="flex-1 rounded-xl border border-[var(--tab-popup-input-border)] bg-[var(--tab-popup-input-bg)] px-3 py-1.5 text-sm text-[var(--tab-popup-input-text)] placeholder:text-[var(--tab-popup-input-placeholder)] focus:border-[var(--tab-popup-input-focus-border)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-popup-input-focus-ring)]" />
              <button onClick={() => bookmarkHandlers.handleAddCustomTag(popupState.customTagInput, popupState.setCustomTagInput)} disabled={!popupState.customTagInput.trim()} className="rounded-xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] px-4 py-1.5 text-sm font-medium text-[var(--tab-popup-primary-text)] shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95">{t('add_tag')}</button>
            </div>
          </footer>
        )}
      </div>

      {/* Bookmark Exists Dialog */}
      {existingBookmark && existingBookmark.needsDialog && (
        <BookmarkExistsDialog
          bookmark={existingBookmark}
          newTags={selectedTags}
          onUpdateTags={async (tags) => { if (existingBookmark.id) await updateExistingBookmarkTags(existingBookmark.id, tags); }}
          onUpdateDescription={async (description) => { if (existingBookmark.id) await updateExistingBookmarkDescription(existingBookmark.id, description); }}
          onCreateSnapshot={async () => { if (existingBookmark.id) await createSnapshotForBookmark(existingBookmark.id); }}
          onCancel={() => setExistingBookmark(null)}
        />
      )}
    </div>
  );
}
