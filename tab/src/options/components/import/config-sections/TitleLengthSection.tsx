/**
 * 标题长度配置区域
 */

import { Type } from 'lucide-react';

interface TitleLengthSectionProps {
  titleLength: 'short' | 'medium' | 'long';
  setTitleLength: (value: 'short' | 'medium' | 'long') => void;
}

export function TitleLengthSection({ titleLength, setTitleLength }: TitleLengthSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Type className="w-4 h-4 text-[var(--tab-options-text)]" />
        <span className="text-sm font-medium text-[var(--tab-options-text)]">标题长度</span>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="选择标题长度">
        {(['short', 'medium', 'long'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setTitleLength(option)}
            role="radio"
            aria-checked={titleLength === option}
            className={`p-3 rounded-lg border-2 transition-all ${
              titleLength === option
                ? 'border-[var(--tab-options-button-primary-bg)] bg-[var(--tab-options-button-primary-bg)]/10 shadow-sm'
                : 'border-[var(--tab-options-button-border)] bg-[var(--tab-options-card-bg)] hover:border-[var(--tab-options-button-border)]'
            }`}
          >
            <div className="text-center">
              <div className={`text-sm font-medium ${titleLength === option ? 'text-[var(--tab-options-title)]' : 'text-[var(--tab-options-text)]'}`}>
                {option === 'short' ? '简短' : option === 'medium' ? '适中' : '详细'}
              </div>
              <div className="text-xs text-[var(--tab-options-text-muted)] mt-0.5">
                {option === 'short' ? '5-15字' : option === 'medium' ? '10-30字' : '20-50字'}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
