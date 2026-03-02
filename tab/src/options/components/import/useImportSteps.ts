/**
 * 导入步骤管理 Hook - 业界标准实现
 * 功能：
 * - 步骤状态管理
 * - 步骤间导航控制
 * - 数据持久化和恢复
 * - 步骤验证
 */

import { useState, useCallback, useEffect } from 'react'
import type { ImportStepType } from './ImportStepIndicator'
import type { ImportStepData, ImportProgressData } from '@/types/import'
import { logger } from '@/lib/utils/logger'

interface UseImportStepsOptions {
  enableAiOrganize: boolean
  storageKey?: string // localStorage key for persistence
  onStepChange?: (step: ImportStepType) => void
}

interface UseImportStepsReturn {
  currentStep: ImportStepType
  completedSteps: ImportStepType[]
  stepData: ImportStepData
  canGoToStep: (step: ImportStepType) => boolean
  goToStep: (step: ImportStepType) => void
  goToNextStep: () => void
  goToPreviousStep: () => void
  completeCurrentStep: (data?: Partial<ImportStepData>) => void
  updateStepData: (step: ImportStepType, data: Partial<ImportStepData>) => void
  resetSteps: () => void
  saveProgress: () => void
  restoreProgress: () => { restored: boolean; data?: ImportProgressData }
}

export function useImportSteps({
  enableAiOrganize,
  storageKey = 'import_progress',
  onStepChange
}: UseImportStepsOptions): UseImportStepsReturn {
  const [currentStep, setCurrentStep] = useState<ImportStepType>('upload')
  const [completedSteps, setCompletedSteps] = useState<ImportStepType[]>([])
  const [stepData, setStepData] = useState<ImportStepData>({})

  // 定义步骤顺序
  const getStepOrder = useCallback((): ImportStepType[] => {
    return enableAiOrganize
      ? ['upload', 'aiOrganize', 'edit', 'import']
      : ['upload', 'edit', 'import']
  }, [enableAiOrganize])

  // 检查是否可以跳转到指定步骤
  const canGoToStep = useCallback((step: ImportStepType): boolean => {
    const stepOrder = getStepOrder()
    const targetIndex = stepOrder.indexOf(step)
    const currentIndex = stepOrder.indexOf(currentStep)

    if (targetIndex === -1) return false

    // 可以返回到之前的步骤或已完成的步骤
    return targetIndex <= currentIndex || completedSteps.includes(step)
  }, [currentStep, completedSteps, getStepOrder])

  // 跳转到指定步骤
  const goToStep = useCallback((step: ImportStepType) => {
    if (!canGoToStep(step)) {
      logger.warn(`Cannot navigate to step: ${step}`)
      return
    }

    setCurrentStep(step)
    onStepChange?.(step)
  }, [canGoToStep, onStepChange])

  // 下一步
  const goToNextStep = useCallback(() => {
    const stepOrder = getStepOrder()
    const currentIndex = stepOrder.indexOf(currentStep)
    
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1]
      setCurrentStep(nextStep)
      onStepChange?.(nextStep)
    }
  }, [currentStep, getStepOrder, onStepChange])

  // 上一步
  const goToPreviousStep = useCallback(() => {
    const stepOrder = getStepOrder()
    const currentIndex = stepOrder.indexOf(currentStep)
    
    if (currentIndex > 0) {
      const previousStep = stepOrder[currentIndex - 1]
      setCurrentStep(previousStep)
      onStepChange?.(previousStep)
    }
  }, [currentStep, getStepOrder, onStepChange])

  // 完成当前步骤
  const completeCurrentStep = useCallback((data?: Partial<ImportStepData>) => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep])
    }
    
    if (data) {
      setStepData(prev => ({
        ...prev,
        [currentStep]: data
      }))
    }
  }, [currentStep, completedSteps])

  // 更新步骤数据
  const updateStepData = useCallback((step: ImportStepType, data: Partial<ImportStepData>) => {
    setStepData(prev => ({
      ...prev,
      [step]: data
    }))
  }, [])

  // 重置所有步骤
  const resetSteps = useCallback(() => {
    setCurrentStep('upload')
    setCompletedSteps([])
    setStepData({})
    
    // 清除持久化数据
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  // 保存进度到 localStorage
  const saveProgress = useCallback(() => {
    if (!storageKey) return

    try {
      const progressData = {
        currentStep,
        completedSteps,
        stepData,
        enableAiOrganize,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(progressData))
      logger.debug('Import progress saved', progressData)
    } catch (error) {
      logger.error('Failed to save import progress', error)
    }
  }, [currentStep, completedSteps, stepData, enableAiOrganize, storageKey])

  // 从 localStorage 恢复进度
  const restoreProgress = useCallback((): { restored: boolean; data?: ImportProgressData } => {
    if (!storageKey) return { restored: false }

    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return { restored: false }

      const progressData = JSON.parse(saved)
      
      // 检查是否是最近 1 小时内的进度
      const isRecent = Date.now() - progressData.timestamp < 3600000
      if (!isRecent) {
        localStorage.removeItem(storageKey)
        return { restored: false }
      }

      // 检查 AI 设置是否匹配
      if (progressData.enableAiOrganize !== enableAiOrganize) {
        logger.warn('AI organize setting mismatch, cannot restore progress')
        return { restored: false }
      }

      setCurrentStep(progressData.currentStep)
      setCompletedSteps(progressData.completedSteps)
      setStepData(progressData.stepData)
      
      logger.info('Import progress restored', progressData)
      return { restored: true, data: progressData.stepData }
    } catch (error) {
      logger.error('Failed to restore import progress', error)
      localStorage.removeItem(storageKey)
      return { restored: false }
    }
  }, [storageKey, enableAiOrganize])

  // 监听 enableAiOrganize 变化，重置步骤（如果已经开始导入）
  useEffect(() => {
    // 如果当前不在 upload 步骤，且 AI 设置变化，需要重置
    if (currentStep !== 'upload' && completedSteps.length > 0) {
      const stepOrder = getStepOrder()
      const currentStepExists = stepOrder.includes(currentStep)
      
      // 如果当前步骤在新的步骤顺序中不存在（例如关闭 AI 后，aiOrganize 步骤消失）
      if (!currentStepExists) {
        logger.warn('Step order changed, resetting to upload')
        setCurrentStep('upload')
        setCompletedSteps([])
      }
    }
  }, [enableAiOrganize, currentStep, completedSteps, getStepOrder])

  // 自动保存进度
  useEffect(() => {
    if (currentStep !== 'upload' && currentStep !== 'import') {
      saveProgress()
    }
  }, [currentStep, completedSteps, stepData, saveProgress])

  // 组件卸载时保存进度
  useEffect(() => {
    return () => {
      if (currentStep !== 'import') {
        saveProgress()
      }
    }
  }, [currentStep, saveProgress])

  return {
    currentStep,
    completedSteps,
    stepData,
    canGoToStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    completeCurrentStep,
    updateStepData,
    resetSteps,
    saveProgress,
    restoreProgress
  }
}
