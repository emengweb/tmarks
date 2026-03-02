/**
 * Tab Collection View Component（协调器）
 */

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { SuccessMessage } from '@/components/SuccessMessage';
import { CollectionOptionsDialog } from '@/components/CollectionOptionsDialog';
import { CloseTabsConfirm } from './components/CloseTabsConfirm';
import { useTabCollectionState } from './hooks/useTabCollectionState';
import { useTabCollectionHandlers } from './hooks/useTabCollectionHandlers';
import { t } from '@/lib/i18n';
import type { BookmarkSiteConfig } from '@/types';

interface TabCollectionViewProps {
  config: BookmarkSiteConfig;
  onBack: () => void;
}

export function TabCollectionView({ config, onBack }: TabCollectionViewProps) {
  const state = useTabCollectionState(config);
  const handlers = useTabCollectionHandlers({
    config,
    tabs: state.tabs,
    selectedTabIds: state.selectedTabIds,
    setSelectedTabIds: state.setSelectedTabIds,
    setIsCollecting: state.setIsCollecting,
    setError: state.setError,
    setSuccessMessage: state.setSuccessMessage,
    setShowCloseConfirm: state.setShowCloseConfirm,
    setCollectedTabIds: state.setCollectedTabIds,
    setShowOptionsDialog: state.setShowOptionsDialog,
    groups: state.groups,
    setGroups: state.setGroups,
  });

  return (
    <div className="relative h-[80vh] min-h-[620px] w-[380px] overflow-hidden rounded-b-2xl bg-[color:var(--tab-popup-bg)] text-[var(--tab-text)] shadow-2xl">
      {state.showOptionsDialog && (
        <CollectionOptionsDialog
          tabCount={state.selectedTabIds.size}
          groups={state.groups}
          onConfirm={handlers.handleConfirmCollection}
          onCancel={() => state.setShowOptionsDialog(false)}
          onCreateFolder={handlers.handleCreateFolder}
        />
      )}

      <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 px-4 pt-2 space-y-2">
        {state.error && (
          <div className="pointer-events-auto">
            <ErrorMessage message={state.error} onDismiss={() => state.setError(null)} />
          </div>
        )}
        {state.successMessage && (
          <div className="pointer-events-auto">
            <SuccessMessage message={state.successMessage} onDismiss={() => state.setSuccessMessage(null)} />
          </div>
        )}
      </div>

      <div className="relative flex h-full flex-col">
        <header className="fixed top-0 left-0 right-0 z-20 px-3 pt-2 pb-2.5 bg-[color:var(--tab-surface)] border-b border-[color:var(--tab-border)] shadow-sm rounded-b-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--tab-text-muted)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] active:scale-95"
              title={t('popup_back')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[color:var(--tab-message-success-bg)] px-2 py-1 text-[10px] text-[var(--tab-message-success-icon)] font-medium">
              {t('tab_collection_total', String(state.tabs.length))}
            </span>
            <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[color:var(--tab-message-success-bg)] px-2 py-1 text-[10px] text-[var(--tab-message-success-icon)] font-medium">
              {t('tab_collection_selected', String(state.selectedTabIds.size))}
            </span>
            <div className="ml-auto flex gap-1.5">
              <button
                onClick={onBack}
                className="rounded-lg border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--tab-text)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] active:scale-95"
              >
                {t('btn_cancel')}
              </button>
              <button
                onClick={handlers.handleShowOptions}
                disabled={state.isCollecting || state.selectedTabIds.size === 0}
                className="rounded-lg border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--tab-text)] transition-all duration-200 hover:bg-[color:var(--tab-surface-muted)] disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
              >
                {t('tab_collection_options')}
              </button>
              <button
                onClick={handlers.handleQuickCollect}
                disabled={state.isCollecting || state.selectedTabIds.size === 0}
                className="rounded-lg px-4 py-1.5 text-[11px] font-semibold shadow-sm transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                style={{
                  background: `linear-gradient(90deg, var(--tab-popup-success-from), var(--tab-popup-success-to))`,
                  color: 'var(--tab-popup-success-text)',
                }}
              >
                {state.isCollecting ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--tab-popup-success-text)' }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('tab_collection_collecting')}
                  </span>
                ) : (
                  t('tab_collection_collect')
                )}
              </button>
            </div>
          </div>
        </header>

        {state.showCloseConfirm && (
          <CloseTabsConfirm
            collectedCount={state.collectedTabIds.length}
            onCloseTabs={() => handlers.handleCloseTabs(state.collectedTabIds)}
            onKeepTabs={handlers.handleKeepTabs}
          />
        )}

        <main className={`relative flex-1 space-y-3 overflow-y-auto px-4 pb-5 bg-[color:var(--tab-popup-bg)] ${state.showCloseConfirm ? 'pt-[180px]' : 'pt-[60px]'}`}>
          {state.isLoading ? (
            <section className="flex items-center gap-3 rounded-2xl border border-[color:var(--tab-border)] bg-[color:var(--tab-surface)] p-4 text-sm text-[var(--tab-text)] shadow-sm">
              <LoadingSpinner />
              <p>{t('tab_collection_loading')}</p>
            </section>
          ) : (
            <>
              <section className="rounded-2xl border border-[color:var(--tab-border)] bg-[color:var(--tab-surface)] p-3 shadow-sm">
                <button
                  onClick={handlers.toggleAll}
                  className="flex w-full items-center justify-between rounded-xl bg-[color:var(--tab-surface-muted)] px-4 py-2 text-sm font-medium text-[var(--tab-text)] transition-all duration-200 hover:opacity-90 active:scale-95"
                >
                  <span>{state.selectedTabIds.size === state.tabs.length ? t('tab_collection_deselect_all') : t('tab_collection_select_all')}</span>
                  <span className="text-xs text-[var(--tab-text-muted)]">
                    {state.selectedTabIds.size} / {state.tabs.length}
                  </span>
                </button>
              </section>

              <section className="space-y-2">
                {state.tabs.map((tab) => {
                  const isSelected = state.selectedTabIds.has(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handlers.toggleTab(tab.id)}
                      className={`group w-full rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? 'border-[color:var(--tab-message-success-border)] bg-[color:var(--tab-message-success-bg)] shadow-md'
                          : 'border-[color:var(--tab-border)] bg-[color:var(--tab-surface)] hover:bg-[color:var(--tab-surface-muted)]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-[color:var(--tab-popup-success-from)] bg-[color:var(--tab-popup-success-from)]'
                            : 'border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)]'
                        }`}>
                          {isSelected && (
                            <svg className="h-3 w-3 text-[var(--tab-popup-success-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {tab.favIconUrl && (
                          <img src={tab.favIconUrl} alt="" className="h-5 w-5 rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--tab-text)]">{tab.title}</p>
                          <p className="truncate text-xs text-[var(--tab-text-muted)]">{tab.url}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
