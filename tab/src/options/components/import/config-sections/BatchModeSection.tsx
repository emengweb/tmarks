/**
 * 批量模式配置区域
 */

interface BatchModeSectionProps {
  batchMode: 'single' | 'batch';
  setBatchMode: (value: 'single' | 'batch') => void;
  batchSize: number;
  setBatchSize: (value: number) => void;
  // concurrency 和 setConcurrency 已禁用
  concurrency?: number;
  setConcurrency?: (value: number) => void;
}

export function BatchModeSection({
  batchMode,
  setBatchMode,
  batchSize,
  setBatchSize,
  // concurrency 和 setConcurrency 已禁用，保留参数以保持接口兼容
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
      <div className="mt-3 space-y-3">
        {batchMode === 'batch' && (
          <div>
            <label htmlFor="batch-size-slider" className="block text-xs text-[var(--tab-options-text)] mb-2">
              每批数量：{batchSize} 个
            </label>
            <input
              id="batch-size-slider"
              type="range"
              min="5"
              max="100"
              step="5"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--tab-options-text-muted)] mt-1">
              <span>5 个（更稳定）</span>
              <span>100 个（更快速）</span>
            </div>
          </div>
        )}
        {/* 并发设置已禁用，因为稳定性问题 */}
        {/* 
        <div>
          <label htmlFor="concurrency-input" className="block text-xs text-[var(--tab-options-text)] mb-2">
            并发数量
          </label>
          <input
            id="concurrency-input"
            type="number"
            min="1"
            value={concurrency}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 1) setConcurrency(val);
            }}
            className="w-full px-3 py-2 bg-[var(--tab-options-card-bg)] border border-[var(--tab-options-button-border)] rounded-lg text-sm text-[var(--tab-options-text)]"
            placeholder="输入并发数量"
          />
          <p className="text-xs text-[var(--tab-options-text-muted)] mt-1">
            {batchMode === 'single' 
              ? '同时处理多个 URL，建议 1-5 个' 
              : '同时处理多个批次，建议 1-5 个'}
          </p>
        </div>
        */}
      </div>
      <p className="text-xs text-[var(--tab-options-text-muted)] mt-2">
        {batchMode === 'single' 
          ? '逐个处理更稳定，适合速率限制严格的 API' 
          : '批量处理更快'}
      </p>
    </div>
  );
}
