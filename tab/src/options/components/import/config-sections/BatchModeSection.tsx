/**
 * 批量模式配置区域
 */

interface BatchModeSectionProps {
  batchMode: 'single' | 'batch';
  setBatchMode: (value: 'single' | 'batch') => void;
  batchSize: number;
  setBatchSize: (value: number) => void;
}

export function BatchModeSection({
  batchMode,
  setBatchMode,
  batchSize,
  setBatchSize,
}: BatchModeSectionProps) {
  return (
    <div className="p-4 bg-[var(--tab-options-card-bg)] rounded-lg border border-[var(--tab-options-button-border)]">
      <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
        处理模式
      </label>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setBatchMode('single')}
          className={`p-4 rounded-lg border-2 transition-all ${
            batchMode === 'single'
              ? 'border-[var(--tab-options-button-primary-bg)] bg-[var(--tab-options-button-primary-bg)]/10'
              : 'border-[var(--tab-options-button-border)] hover:border-[var(--tab-options-button-border)]'
          }`}
        >
          <div className="text-sm font-medium text-[var(--tab-options-title)]">逐个处理</div>
          <div className="text-xs text-[var(--tab-options-text-muted)] mt-1">
            每次发送 1 个 URL，更稳定
          </div>
        </button>
        <button
          onClick={() => setBatchMode('batch')}
          className={`p-4 rounded-lg border-2 transition-all ${
            batchMode === 'batch'
              ? 'border-[var(--tab-options-button-primary-bg)] bg-[var(--tab-options-button-primary-bg)]/10'
              : 'border-[var(--tab-options-button-border)] hover:border-[var(--tab-options-button-border)]'
          }`}
        >
          <div className="text-sm font-medium text-[var(--tab-options-title)]">批量处理</div>
          <div className="text-xs text-[var(--tab-options-text-muted)] mt-1">
            每次发送多个 URL，更快速
          </div>
        </button>
      </div>
      {batchMode === 'batch' && (
        <div className="mt-3">
          <label htmlFor="batch-size-slider" className="block text-xs text-[var(--tab-options-text)] mb-2">
            每批数量：{batchSize} 个
          </label>
          <input
            id="batch-size-slider"
            type="range"
            min="1"
            max="50"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}
      <p className="text-xs text-[var(--tab-options-text-muted)] mt-2">
        {batchMode === 'single' 
          ? '逐个处理更稳定，适合速率限制严格的 API' 
          : '批量处理更快，但可能消耗更多 token'}
      </p>
    </div>
  );
}
