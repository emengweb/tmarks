/**
 * 标签数量配置区域（仅 TMarks 模式）
 */

import { Hash } from 'lucide-react';

interface TagCountSectionProps {
  tagCountMin: number;
  setTagCountMin: (value: number) => void;
  tagCountMax: number;
  setTagCountMax: (value: number) => void;
}

export function TagCountSection({
  tagCountMin,
  setTagCountMin,
  tagCountMax,
  setTagCountMax,
}: TagCountSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Hash className="w-4 h-4 text-[var(--tab-options-text)]" />
        <span className="text-sm font-medium text-[var(--tab-options-text)]">标签数量</span>
      </div>
      <div className="p-4 bg-[var(--tab-options-card-bg)] rounded-lg border border-[var(--tab-options-button-border)]">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tag-count-min" className="text-xs text-[var(--tab-options-text)]">最少</label>
              <span className="text-sm font-medium text-[var(--tab-options-title)]" aria-live="polite">{tagCountMin} 个</span>
            </div>
            <input
              id="tag-count-min"
              type="range"
              min="1"
              max="3"
              value={tagCountMin}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTagCountMin(val);
                if (val > tagCountMax) setTagCountMax(val);
              }}
              className="w-full"
              aria-label="设置最少标签数量"
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={tagCountMin}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="tag-count-max" className="text-xs text-[var(--tab-options-text)]">最多</label>
              <span className="text-sm font-medium text-[var(--tab-options-title)]" aria-live="polite">{tagCountMax} 个</span>
            </div>
            <input
              id="tag-count-max"
              type="range"
              min="1"
              max="10"
              value={tagCountMax}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTagCountMax(val);
                if (val < tagCountMin) setTagCountMin(val);
              }}
              className="w-full"
              aria-label="设置最多标签数量"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={tagCountMax}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
