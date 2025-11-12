import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, errorText, fullWidth = false, className = '', ...props }, ref) => {
    const hasError = !!errorText;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-[var(--text-color)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            px-3 py-2 rounded-lg border bg-[var(--input-bg)] text-[var(--text-color)]
            focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${hasError ? 'border-[var(--danger-border)]' : 'border-[var(--border)]'}
            ${fullWidth ? 'w-full' : ''}
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={
            hasError && props.id ? `${props.id}-error` : helperText && props.id ? `${props.id}-helper` : undefined
          }
          {...props}
        />
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

Input.displayName = 'Input';

