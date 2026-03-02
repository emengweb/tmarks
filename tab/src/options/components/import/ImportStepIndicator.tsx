/**
 * 导入步骤指示器组件 - 业界标准实现
 * 功能：
 * - 显示当前步骤和进度
 * - 支持点击已完成步骤返回
 * - 响应式设计，支持移动端
 * - 完整的无障碍支持
 * - 动画过渡效果
 */

import { Check } from 'lucide-react'

export type ImportStepType = 'upload' | 'aiOrganize' | 'edit' | 'import'

interface Step {
  id: ImportStepType
  label: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
}

interface ImportStepIndicatorProps {
  currentStep: ImportStepType
  enableAiOrganize: boolean
  completedSteps: ImportStepType[]
  onStepClick?: (step: ImportStepType) => void
  canNavigate?: boolean
  className?: string
}

export function ImportStepIndicator({
  currentStep,
  enableAiOrganize,
  completedSteps,
  onStepClick,
  canNavigate = true,
  className = ''
}: ImportStepIndicatorProps) {
  // 定义所有步骤 - 使用更清晰的文案
  const allSteps: Step[] = [
    {
      id: 'upload',
      label: '上传文件',
      description: '选择书签文件'
    },
    {
      id: 'aiOrganize',
      label: 'AI 整理',
      description: '智能分类标签'
    },
    {
      id: 'edit',
      label: '编辑确认',
      description: '检查和修改'
    },
    {
      id: 'import',
      label: '完成导入',
      description: '导入到系统'
    }
  ]

  // 根据是否启用 AI 整理过滤步骤
  const steps = enableAiOrganize 
    ? allSteps 
    : allSteps.filter(s => s.id !== 'aiOrganize')

  const currentIndex = steps.findIndex(s => s.id === currentStep)

  const handleStepClick = (step: Step) => {
    if (!canNavigate || !onStepClick) return
    
    // 只能点击当前步骤之前的步骤（包括已完成的）
    const stepIndex = steps.findIndex(s => s.id === step.id)
    if (stepIndex < currentIndex) {
      onStepClick(step.id)
    }
  }

  const isStepCompleted = (stepId: ImportStepType) => completedSteps.includes(stepId)
  const isStepCurrent = (stepId: ImportStepType) => stepId === currentStep
  const isStepClickable = (stepId: ImportStepType) => {
    if (!canNavigate) return false
    const stepIndex = steps.findIndex(s => s.id === stepId)
    // 只能点击当前步骤之前的步骤
    return stepIndex < currentIndex
  }

  // 计算整体进度百分比（避免除以 0）
  const progressPercentage = steps.length > 1 
    ? ((currentIndex + 1) / steps.length) * 100
    : 100

  return (
    <div className={`mb-8 ${className}`}>
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--tab-options-title)]">
            导入进度: {currentIndex + 1} / {steps.length}
          </span>
          <span className="text-sm font-medium text-[var(--tab-message-info-icon)]">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div 
          className="w-full bg-[var(--tab-options-progress-bar-bg)] rounded-full h-2 overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`导入进度 ${Math.round(progressPercentage)}%`}
        >
          <div
            className="bg-[var(--tab-options-progress-bar-fill)] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 步骤导航 */}
      <nav aria-label="导入步骤导航">
        <ol className="flex items-start relative px-4">
          {/* 背景连接线 */}
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-[var(--tab-options-button-border)] -z-10" aria-hidden="true" />
          <div 
            className="absolute top-5 left-8 h-0.5 bg-[var(--tab-options-progress-bar-fill)] -z-10 transition-all duration-500"
            style={{ 
              width: steps.length > 1 
                ? `calc((100% - 4rem) * ${currentIndex / (steps.length - 1)})` 
                : 'calc(100% - 4rem)'
            }}
            aria-hidden="true"
          />

          {steps.map((step, index) => {
            const completed = isStepCompleted(step.id)
            const current = isStepCurrent(step.id)
            const clickable = isStepClickable(step.id)

            return (
              <li 
                key={step.id} 
                className="flex flex-col items-center relative flex-1"
              >
                <button
                  type="button"
                  onClick={() => handleStepClick(step)}
                  disabled={!clickable}
                  className={`group flex flex-col items-center transition-all ${
                    clickable ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  aria-current={current ? 'step' : undefined}
                  aria-label={`步骤 ${index + 1}: ${step.label}${completed ? ' (已完成)' : current ? ' (当前)' : ''}`}
                  title={clickable ? `点击返回到 ${step.label}` : undefined}
                >
                  {/* 步骤圆圈 */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm ${
                      completed
                        ? 'border-[var(--tab-message-success-icon)] bg-[var(--tab-message-success-icon)] text-[var(--tab-message-success-icon-text)]'
                        : current
                        ? 'border-[var(--tab-message-info-icon)] bg-[var(--tab-message-info-icon)] text-[var(--tab-message-info-icon-text)] ring-4 ring-[var(--tab-message-info-bg)]'
                        : 'border-[var(--tab-options-button-border)] bg-[var(--tab-options-card-bg)] text-[var(--tab-options-text-muted)]'
                    } ${
                      clickable && !current
                        ? 'group-hover:border-[var(--tab-message-info-border)] group-hover:bg-[var(--tab-message-info-bg)] group-hover:scale-110 group-hover:shadow-md'
                        : ''
                    }`}
                  >
                    {completed ? (
                      <Check className="h-5 w-5 animate-in fade-in zoom-in duration-300" aria-hidden="true" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* 步骤标签 - 优化布局 */}
                  <div className="mt-3 text-center w-full px-2">
                    <div
                      className={`text-sm font-medium transition-colors leading-tight ${
                        current
                          ? 'text-[var(--tab-message-info-icon)]'
                          : completed
                          ? 'text-[var(--tab-message-success-icon)]'
                          : 'text-[var(--tab-options-text-muted)]'
                      } ${
                        clickable && !current
                          ? 'group-hover:text-[var(--tab-message-info-icon)]'
                          : ''
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-[var(--tab-options-text-muted)] mt-0.5 leading-tight">
                      {step.description}
                    </div>
                  </div>

                  {/* 可点击提示 */}
                  {clickable && !current && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-xs text-[var(--tab-message-info-icon)] whitespace-nowrap">
                        点击返回
                      </span>
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* 当前步骤说明 - 优化样式 */}
      <div className="mt-8 p-4 bg-[var(--tab-message-info-bg)] rounded-lg border border-[var(--tab-message-info-border)]">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--tab-message-info-icon)] text-[var(--tab-message-info-icon-text)] flex items-center justify-center text-xs font-bold">
            {currentIndex + 1}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[var(--tab-options-title)] mb-1">
              步骤 {currentIndex + 1}: {steps[currentIndex].label}
            </h4>
            <p className="text-xs text-[var(--tab-message-info-icon)]">
              {steps[currentIndex].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
