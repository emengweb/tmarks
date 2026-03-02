/**
 * 描述详细度配置区域
 */

import { FileText } from 'lucide-react';

interface DescriptionSectionProps {
  descriptionDetail: 'minimal' | 'short' | 'detailed';
  setDescriptionDetail: (value: 'minimal' | 'short' | 'detailed') => void;
}

export function DescriptionSection({ descriptionDetail, setDescriptionDetail }: DescriptionSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[var(--tab-options-text)]" />
        <span className="text-sm font-medium text-[var(--tab-options-text)]">描述详细度</span>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="选择描述详细度">
        {(['minimal', 'short', 'detailed'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setDescriptionDetail(option)}
            role="radio"
            aria-checked={descriptionDetail === option}
            className={`p-3 rounded-lg border-2 transition-all ${
              descriptionDetail === option
                ? 'border-[var(--tab-options-button-primary-bg)] bg-[var(--tab-options-button-primary-bg)]/10 shadow-sm'
                : 'border-[var(--tab-options-button-border)] bg-[var(--tab-options-card-bg)] hover:border-[var(--tab-options-button-border)]'
            }`}
          >
            <div className="text-center">
              <div className={`text-sm font-medium ${descriptionDetail === option ? 'text-[var(--tab-options-title)]' : 'text-[var(--tab-options-text)]'}`}>
                {option === 'minimal' ? '极简' : option === 'short' ? '简短' : '详细'}
              </div>
              <div className="text-xs text-[var(--tab-options-text-muted)] mt-0.5">
                {option === 'minimal' ? '10-20字' : option === 'short' ? '20-50字' : '50-100字'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
