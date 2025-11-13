import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, errorText, fullWidth = false, options, placeholder, className = '', ...props }, ref) => {
    const hasError = !!errorText;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-xs font-normal text-[var(--text-color)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              px-3 py-2.5 rounded-lg border bg-[var(--input-bg)] text-[var(--muted-foreground)]
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              appearance-none cursor-pointer text-xs
              ${hasError ? 'border-[var(--danger-border)]' : 'border-[var(--border)]'}
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
            aria-invalid={hasError}
            aria-describedby={
              hasError && props.id ? `${props.id}-error` : helperText && props.id ? `${props.id}-helper` : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
        </div>
        {errorText && (
          <p
            id={props.id ? `${props.id}-error` : undefined}
            className="mt-1.5 text-sm text-[var(--danger-text)]"
          >
            {errorText}
          </p>
        )}
        {helperText && !errorText && (
          <p
            id={props.id ? `${props.id}-helper` : undefined}
            className="mt-1.5 text-sm text-[var(--muted-foreground)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

