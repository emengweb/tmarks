/**
 * AI 整理配置面板组件 - 重构版
 * 使用独立的section组件
 */

import { Sparkles } from 'lucide-react'
import { BatchModeSection } from './config-sections/BatchModeSection'
import { TitleLengthSection } from './config-sections/TitleLengthSection'
import { DescriptionSection } from './config-sections/DescriptionSection'
import { TagCountSection } from './config-sections/TagCountSection'
import { LanguageSection } from './config-sections/LanguageSection'
import { TemperatureSection } from './config-sections/TemperatureSection'
import { CustomStyleSection } from './config-sections/CustomStyleSection'
import { PredefinedFoldersSection } from './config-sections/PredefinedFoldersSection'

interface AIOrganizeConfigProps {
  mode: 'tmarks' | 'newtab'
  batchMode: 'single' | 'batch'
  setBatchMode: (value: 'single' | 'batch') => void
  batchSize: number
  setBatchSize: (value: number) => void
  titleLength: 'short' | 'medium' | 'long'
  setTitleLength: (value: 'short' | 'medium' | 'long') => void
  descriptionDetail: 'minimal' | 'short' | 'detailed'
  setDescriptionDetail: (value: 'minimal' | 'short' | 'detailed') => void
  tagCountMin: number
  setTagCountMin: (value: number) => void
  tagCountMax: number
  setTagCountMax: (value: number) => void
  language: 'zh' | 'en' | 'mixed'
  setLanguage: (value: 'zh' | 'en' | 'mixed') => void
  temperature: number
  setTemperature: (value: number) => void
  useCustomStyle: boolean
  setUseCustomStyle: (value: boolean) => void
  customStyle: string
  setCustomStyle: (value: string) => void
  existingFolders: string[]
  predefinedFolders?: string[]
  setPredefinedFolders?: (folders: string[]) => void
  onStart: () => void
}

export function AIOrganizeConfig({
  mode,
  batchMode,
  setBatchMode,
  batchSize,
  setBatchSize,
  titleLength,
  setTitleLength,
  descriptionDetail,
  setDescriptionDetail,
  tagCountMin,
  setTagCountMin,
  tagCountMax,
  setTagCountMax,
  language,
  setLanguage,
  temperature,
  setTemperature,
  useCustomStyle,
  setUseCustomStyle,
  customStyle,
  setCustomStyle,
  existingFolders,
  predefinedFolders = [],
  setPredefinedFolders,
  onStart
}: AIOrganizeConfigProps) {
  return (
    <div className="space-y-4">
      <div className="p-6 bg-[var(--tab-message-info-bg)] rounded-xl border border-[var(--tab-message-info-border)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--tab-message-info-icon)] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[var(--tab-message-info-icon-text)]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--tab-options-title)]">AI 智能整理</h3>
            <p className="text-sm text-[var(--tab-options-text)] mt-1">
              配置 AI 整理选项，开始批量处理
            </p>
          </div>
        </div>
      </div>

      <BatchModeSection
        batchMode={batchMode}
        setBatchMode={setBatchMode}
        batchSize={batchSize}
        setBatchSize={setBatchSize}
      />

      <TitleLengthSection
        titleLength={titleLength}
        setTitleLength={setTitleLength}
      />

      <DescriptionSection
        descriptionDetail={descriptionDetail}
        setDescriptionDetail={setDescriptionDetail}
      />

      {mode === 'tmarks' && (
        <TagCountSection
          tagCountMin={tagCountMin}
          setTagCountMin={setTagCountMin}
          tagCountMax={tagCountMax}
          setTagCountMax={setTagCountMax}
        />
      )}

      {mode === 'newtab' && setPredefinedFolders && (
        <PredefinedFoldersSection
          predefinedFolders={predefinedFolders}
          setPredefinedFolders={setPredefinedFolders}
          existingFolders={existingFolders}
        />
      )}

      <LanguageSection
        language={language}
        setLanguage={setLanguage}
      />

      <TemperatureSection
        temperature={temperature}
        setTemperature={setTemperature}
      />

      <CustomStyleSection
        mode={mode}
        useCustomStyle={useCustomStyle}
        setUseCustomStyle={setUseCustomStyle}
        customStyle={customStyle}
        setCustomStyle={setCustomStyle}
      />

      <button
        onClick={onStart}
        className="w-full px-6 py-3 bg-[var(--tab-options-button-primary-bg)] text-[var(--tab-options-button-primary-text)] rounded-lg hover:bg-[var(--tab-options-button-primary-hover)] transition-colors"
      >
        开始 AI 整理
      </button>
    </div>
  )
}
