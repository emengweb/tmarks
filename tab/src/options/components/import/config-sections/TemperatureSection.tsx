/**
 * 温度参数配置 Section
 */

import { Zap } from 'lucide-react'

interface TemperatureSectionProps {
  temperature: number
  setTemperature: (value: number) => void
}

export function TemperatureSection({ temperature, setTemperature }: TemperatureSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-[var(--tab-options-text)]" />
        <span className="text-sm font-medium text-[var(--tab-options-text)]">创造性</span>
        <span className="text-xs text-[var(--tab-options-text)] ml-auto">{temperature.toFixed(1)}</span>
      </div>
      <div className="p-4 bg-[var(--tab-options-card-bg)] rounded-lg border border-[var(--tab-options-button-border)]">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full"
          aria-label="设置 AI 创造性参数"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={temperature}
        />
        <div className="flex justify-between text-xs text-[var(--tab-options-text)] mt-2">
          <span>保守（0.0）</span>
          <span>平衡（0.7）</span>
          <span>创新（1.0）</span>
        </div>
        <p className="text-xs text-[var(--tab-options-text)] mt-2">
          {temperature < 0.4 && '更保守，结果更一致'}
          {temperature >= 0.4 && temperature < 0.8 && '平衡模式，推荐使用'}
          {temperature >= 0.8 && '更有创造性，结果更多样'}
        </p>
      </div>
    </div>
  )
}
