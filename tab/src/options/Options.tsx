import { useMemo, useState } from 'react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { SuccessMessage } from '@/components/SuccessMessage';
import { AIConfigSection } from './components/AIConfigSection';
import { TMarksConfigSection } from './components/TMarksConfigSection';
import { PreferencesSection } from './components/PreferencesSection';
import { CacheStatusSection } from './components/CacheStatusSection';
import { PresetModal } from './components/PresetModal';
import { TMarksTagSection } from './components/TMarksTagSection';
import { NewTabTagSection } from './components/NewTabTagSection';
import type { FormDataSetter } from '@/types/form';
import { ImportSection } from './components/ImportSection';
import { useOptionsForm } from './hooks/useOptionsForm';
import { t } from '@/lib/i18n';

export function Options() {
  const {
    error,
    successMessage,
    isLoading,
    setError,
    setSuccessMessage,

    formData,
    setFormData,

    stats,
    isTesting,

    availableModels,
    isFetchingModels,
    modelFetchError,
    modelFetchSupported,

    allSavedConnections,

    isPresetModalOpen,
    presetLabel,
    isSavingPreset,
    presetError,

    setPresetLabel,

    handleProviderChange,
    refreshModelOptions,
    handleSave,
    handleSync,
    formatDate,
    handleReset,
    handleTestAPI,

    handleSaveConnectionPreset,
    handleConfirmSaveConnectionPreset,
    handleClosePresetModal,
    handleApplySavedConnection,
    handleDeleteSavedConnection,
  } = useOptionsForm();

  type OptionsTab = 'ai' | 'tmarkstag' | 'newtabtag' | 'import' | 'preferences' | 'tmarks';
  const [activeTab, setActiveTab] = useState<OptionsTab>('ai');

  const tabs = useMemo(
    () =>
      [
        { id: 'ai' as const, label: t('options_tab_ai') },
        { id: 'tmarkstag' as const, label: t('options_tab_tmarks_manage') },
        { id: 'newtabtag' as const, label: t('options_tab_newtab_manage') },
        { id: 'import' as const, label: t('options_tab_import') },
        { id: 'preferences' as const, label: t('options_tab_preferences') },
        { id: 'tmarks' as const, label: t('options_tab_tmarks') },
      ],
    []
  );

  return (
    <>
      {/* Notifications - Fixed at top */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <div className="pointer-events-auto w-full max-w-md space-y-2">
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}
          {successMessage && <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
        </div>
      </div>

      <div className="min-h-screen w-screen bg-gradient-to-br from-[var(--tab-options-page-bg-from)] via-[var(--tab-options-page-bg-via)] to-[var(--tab-options-page-bg-to)]">
        <div className="w-4/5 mx-auto px-6 py-12">
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--tab-options-hero-gradient-from)] via-[color:var(--tab-options-hero-gradient-via)] to-[color:var(--tab-options-hero-gradient-to)]" />
            <div className="relative p-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--tab-options-pill-bg)] text-sm font-medium text-[var(--tab-options-pill-text)]">
                {t('options_title')}
              </div>
              <h1 className="mt-4 text-4xl font-bold text-[var(--tab-options-title)] tracking-tight">{t('options_subtitle')}</h1>
              <p className="mt-3 max-w-2xl text-base text-[var(--tab-options-text)]">
                {t('options_description')}
              </p>
              <p className="mt-2 text-sm text-[var(--tab-options-text-muted)]">
                {t('options_global_hint')}
              </p>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3 text-xs font-medium text-[var(--tab-options-text-muted)]">
                  <span className="px-3 py-1 rounded-full bg-[color:var(--tab-options-tag-bg)] border border-[color:var(--tab-options-tag-border)]">{t('options_tag_ai')}</span>
                  <span className="px-3 py-1 rounded-full bg-[color:var(--tab-options-tag-bg)] border border-[color:var(--tab-options-tag-border)]">{t('options_tag_sync')}</span>
                  <span className="px-3 py-1 rounded-full bg-[color:var(--tab-options-tag-bg)] border border-[color:var(--tab-options-tag-border)]">{t('options_tag_security')}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-[color:var(--tab-options-button-border)] px-4 py-2 text-sm font-medium text-[var(--tab-options-button-text)] hover:bg-[var(--tab-options-button-hover-bg)] transition-colors whitespace-nowrap"
                  >
                    {t('btn_reset')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="rounded-lg bg-[var(--tab-options-button-primary-bg)] px-4 py-2 text-sm font-medium text-[var(--tab-options-button-primary-text)] shadow-sm hover:bg-[var(--tab-options-button-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60 transition-colors whitespace-nowrap"
                  >
                    {isLoading ? t('btn_saving') : t('btn_save')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <div className="sticky top-8 space-y-4">
                <div className="rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur p-3">
                  <div className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)]'
                            : 'text-[var(--tab-options-text)] hover:bg-[var(--tab-options-button-hover-bg)]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <CacheStatusSection stats={stats} handleSync={handleSync} isLoading={isLoading} formatDate={formatDate} />
              </div>
            </div>

            <div className="lg:col-span-9 space-y-8">
              {activeTab === 'ai' && (
                <AIConfigSection
                  formData={formData}
                  setFormData={setFormData}
                  handleProviderChange={handleProviderChange}
                  handleTestConnection={handleTestAPI}
                  isTesting={isTesting}
                  availableModels={availableModels}
                  isFetchingModels={isFetchingModels}
                  modelFetchError={modelFetchError}
                  onRefreshModels={refreshModelOptions}
                  modelFetchSupported={modelFetchSupported}
                  allSavedConnections={allSavedConnections}
                  onApplySavedConnection={handleApplySavedConnection}
                  onDeleteSavedConnection={handleDeleteSavedConnection}
                  onSaveConnectionPreset={handleSaveConnectionPreset}
                />
              )}

              {activeTab === 'tmarkstag' && (
                <TMarksTagSection formData={formData} setFormData={setFormData as FormDataSetter} setSuccessMessage={setSuccessMessage} />
              )}

              {activeTab === 'newtabtag' && (
                <NewTabTagSection formData={formData} setFormData={setFormData as FormDataSetter} setSuccessMessage={setSuccessMessage} />
              )}

              {activeTab === 'import' && (
                <ImportSection formData={formData} setSuccessMessage={setSuccessMessage} setError={setError} />
              )}

              {activeTab === 'preferences' && (
                <PreferencesSection formData={formData} setFormData={setFormData as FormDataSetter} />
              )}

              {activeTab === 'tmarks' && (
                <TMarksConfigSection formData={formData} setFormData={setFormData as FormDataSetter} />
              )}
            </div>
          </div>
        </div>
      </div>

      {isPresetModalOpen && (
        <PresetModal
          isOpen={isPresetModalOpen}
          presetLabel={presetLabel}
          presetError={presetError}
          isSaving={isSavingPreset}
          onClose={handleClosePresetModal}
          onConfirm={handleConfirmSaveConnectionPreset}
          onChangeLabel={setPresetLabel}
        />
      )}
    </>
  );
}
