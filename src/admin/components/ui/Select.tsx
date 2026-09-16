import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      children,
      className = '',
      id,
      required,
      disabled,
      ...rest
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[12px] font-semibold text-gray-700 tracking-wide"
          >
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            className={`w-full appearance-none pl-3.5 pr-10 py-2 text-[13px] text-gray-900 rounded-xl transition-all shadow-sm cursor-pointer ${
              error
                ? 'bg-rose-50/40 border border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:bg-white'
                : 'bg-white/60 border border-white/60 hover:border-white/80 focus:bg-white/95 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20'
            } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...rest}
          >
            {options
              ? options.map((opt) => (
                  <option
                    key={String(opt.value)}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3 pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
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

Select.displayName = 'Select';
