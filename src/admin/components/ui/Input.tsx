import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      iconLeft,
      iconRight,
      className = '',
      id,
      required,
      disabled,
      ...rest
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-semibold text-gray-700 tracking-wide"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {iconLeft && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-gray-400">
              {iconLeft}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            disabled={disabled}
            className={`w-full py-2 text-[13px] text-gray-900 placeholder:text-gray-400 rounded-xl transition-all shadow-sm ${
              iconLeft ? 'pl-10' : 'pl-3.5'
            } ${iconRight ? 'pr-10' : 'pr-3.5'} ${
              error
                ? 'bg-rose-50/40 border border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-white'
                : 'bg-white/60 border border-white/60 hover:border-white/80 focus:bg-white/95 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20'
            } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...rest}
          />

          {iconRight && (
            <div className="absolute right-3.5 flex items-center text-gray-400">
              {iconRight}
            </div>
          )}
        </div>

        {error && (
          <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-[11px] text-gray-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCount = false,
      maxLength,
      className = '',
      id,
      required,
      disabled,
      value,
      rows = 3,
      ...rest
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-[12px] font-semibold text-gray-700 tracking-wide"
            >
              {label}
              {required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
          )}

          {showCount && maxLength && (
            <span
              className={`text-[11px] font-mono ${
                currentLength >= maxLength ? 'text-rose-500 font-bold' : 'text-gray-400'
              }`}
            >
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          value={value}
          className={`w-full p-3 text-[13px] text-gray-900 placeholder:text-gray-400 rounded-xl transition-all shadow-sm resize-y ${
            error
              ? 'bg-rose-50/40 border border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-white'
              : 'bg-white/60 border border-white/60 hover:border-white/80 focus:bg-white/95 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20'
          } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...rest}
        />

        {error && (
          <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-[11px] text-gray-400 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
