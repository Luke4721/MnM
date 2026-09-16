import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'brand'
  | 'danger'
  | 'dangerOutline'
  | 'ghost'
  | 'outline';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      className = '',
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4 py-2 text-[13px] rounded-xl gap-2',
      lg: 'px-5 py-2.5 text-sm rounded-xl gap-2.5',
    };

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-gradient-to-r from-rose-500/90 to-indigo-500/90 hover:from-rose-500 hover:to-indigo-600 text-white font-semibold shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_16px_rgba(99,102,241,0.4)] border border-white/20 hover:-translate-y-0.5',
      secondary:
        'bg-white/70 hover:bg-white/95 text-gray-700 hover:text-gray-900 border border-white/60 shadow-sm backdrop-blur-md hover:-translate-y-0.5',
      brand:
        'bg-[#FF9933] hover:bg-[#F2871F] text-white font-semibold shadow-[0_4px_12px_rgba(255,153,51,0.25)] hover:shadow-[0_6px_16px_rgba(255,153,51,0.35)] border border-white/20 hover:-translate-y-0.5',
      danger:
        'bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-[0_4px_12px_rgba(244,63,94,0.25)] hover:shadow-[0_6px_16px_rgba(244,63,94,0.35)] hover:-translate-y-0.5',
      dangerOutline:
        'bg-rose-50/80 hover:bg-rose-100 text-rose-700 border border-rose-200/80 shadow-sm',
      ghost:
        'bg-transparent hover:bg-white/60 text-gray-600 hover:text-gray-900',
      outline:
        'border border-gray-200/80 bg-white/50 hover:bg-white text-gray-700 shadow-sm',
    };

    const spinnerColor =
      variant === 'primary' || variant === 'brand' || variant === 'danger'
        ? 'white'
        : 'gray';

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
        {...rest}
      >
        {loading ? (
          <>
            <LoadingSpinner size={size === 'sm' ? 'xs' : 'sm'} variant={spinnerColor} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {iconLeft && <span className="shrink-0 flex items-center">{iconLeft}</span>}
            {children}
            {iconRight && <span className="shrink-0 flex items-center">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
