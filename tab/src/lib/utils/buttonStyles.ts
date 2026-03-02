/**
 * 统一的按钮样式工具
 * 提供一致的按钮样式类名
 */

/**
 * 按钮变体类型
 */
export type ButtonVariant = 
  | 'primary'      // 主要按钮
  | 'secondary'    // 次要按钮
  | 'neutral'      // 中性按钮
  | 'danger'       // 危险按钮
  | 'success'      // 成功按钮
  | 'ghost';       // 幽灵按钮

/**
 * 按钮尺寸类型
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * 按钮样式配置
 */
interface ButtonStyleConfig {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * 获取按钮基础样式
 */
const getBaseStyles = (): string => {
  return 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
};

/**
 * 获取按钮变体样式
 */
const getVariantStyles = (variant: ButtonVariant): string => {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: 'bg-white/10 hover:bg-white/20 text-white focus:ring-white/20',
    neutral: 'bg-[var(--tab-popup-action-neutral-bg)] hover:bg-[var(--tab-popup-action-neutral-bg-hover)] text-[var(--tab-popup-text)]',
    danger: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 focus:ring-red-500',
    success: 'bg-green-500/20 hover:bg-green-500/30 text-green-300 focus:ring-green-500',
    ghost: 'bg-transparent hover:bg-white/10 text-white/70',
  };
  return variants[variant];
};

/**
 * 获取按钮尺寸样式
 */
const getSizeStyles = (size: ButtonSize): string => {
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
  };
  return sizes[size];
};

/**
 * 获取禁用状态样式
 */
const getDisabledStyles = (): string => {
  return 'disabled:opacity-50 disabled:cursor-not-allowed';
};

/**
 * 获取完整的按钮样式类名
 */
export function getButtonStyles(config: ButtonStyleConfig = {}): string {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    className = '',
  } = config;

  const styles = [
    getBaseStyles(),
    getVariantStyles(variant),
    getSizeStyles(size),
    fullWidth ? 'w-full' : '',
    disabled ? getDisabledStyles() : '',
    className,
  ];

  return styles.filter(Boolean).join(' ');
}

/**
 * 预定义的按钮样式快捷方式
 */
export const buttonStyles = {
  primary: (className?: string) => getButtonStyles({ variant: 'primary', className }),
  secondary: (className?: string) => getButtonStyles({ variant: 'secondary', className }),
  neutral: (className?: string) => getButtonStyles({ variant: 'neutral', className }),
  danger: (className?: string) => getButtonStyles({ variant: 'danger', className }),
  success: (className?: string) => getButtonStyles({ variant: 'success', className }),
  ghost: (className?: string) => getButtonStyles({ variant: 'ghost', className }),
  
  // 尺寸变体
  sm: {
    primary: (className?: string) => getButtonStyles({ variant: 'primary', size: 'sm', className }),
    secondary: (className?: string) => getButtonStyles({ variant: 'secondary', size: 'sm', className }),
    neutral: (className?: string) => getButtonStyles({ variant: 'neutral', size: 'sm', className }),
  },
  
  lg: {
    primary: (className?: string) => getButtonStyles({ variant: 'primary', size: 'lg', className }),
    secondary: (className?: string) => getButtonStyles({ variant: 'secondary', size: 'lg', className }),
  },
};
