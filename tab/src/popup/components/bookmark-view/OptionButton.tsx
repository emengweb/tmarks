/**
 * 选项按钮组件
 */

interface OptionButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  activeClass: string;
  children: React.ReactNode;
}

export function OptionButton({
  active,
  onClick,
  disabled,
  title,
  activeClass,
  children,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 ${
        active
          ? activeClass
          : 'bg-[var(--tab-popup-action-neutral-bg)] text-[var(--tab-popup-action-neutral-text)] hover:bg-[var(--tab-popup-action-neutral-bg-hover)]'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
      title={title}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {children}
      </svg>
    </button>
  );
}
