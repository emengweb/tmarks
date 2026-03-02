/**
 * 上传步骤组件 - 重构版
 */

import type { ImportFormat, ImportOptions } from '@/types/import'
import type { NormalizeResult, NormalizeProgress } from '@/lib/import/normalizer'
import { AIToggleSection, FormatSelector, FileUploader, ImportOptionsSection } from './upload-sections'

interface UploadStepProps {
  selectedFormat: ImportFormat
  setSelectedFormat: (format: ImportFormat) => void
  selectedFile: File | null
  isValidating: boolean
  normalizeResult: NormalizeResult | null
  normalizeProgress: NormalizeProgress | null
  enableAiOrganize: boolean
  setEnableAiOrganize: (enable: boolean) => void
  isAiRequired: boolean
  options: ImportOptions
  setOptions: (options: ImportOptions) => void
  onFileSelect: (file: File) => void
  onReset: () => void
  onStartImport: () => void
}

export function UploadStep({
  selectedFormat,
  setSelectedFormat,
  selectedFile,
  isValidating,
  normalizeResult,
  normalizeProgress,
  enableAiOrganize,
  setEnableAiOrganize,
  isAiRequired,
  options,
  setOptions,
  onFileSelect,
  onReset,
  onStartImport
}: UploadStepProps) {
  const canStartImport = selectedFile && normalizeResult && normalizeResult.validUrls.length > 0

  return (
    <div className="space-y-6">
      <AIToggleSection
        enableAiOrganize={enableAiOrganize}
        setEnableAiOrganize={setEnableAiOrganize}
        isAiRequired={isAiRequired}
        selectedFile={selectedFile}
        normalizeResult={normalizeResult}
      />

      <FormatSelector
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
      />

      <FileUploader
        selectedFile={selectedFile}
        isValidating={isValidating}
        normalizeResult={normalizeResult}
        normalizeProgress={normalizeProgress}
        onFileSelect={onFileSelect}
        onReset={onReset}
      />

      <ImportOptionsSection
        options={options}
        setOptions={setOptions}
      />

      <button
        onClick={onStartImport}
        disabled={!canStartImport}
        className="w-full px-6 py-3 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg hover:bg-[var(--tab-options-button-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {chrome.i18n.getMessage('import_start')}
      </button>
    </div>
  )
}
