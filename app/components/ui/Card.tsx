import { ReactNode } from 'react';

type CardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

type CardProps = {
  children?: ReactNode;
  header?: string;
  value?: string | number;
  subtext?: string;
  variant?: CardVariant;
  className?: string;
  icon?: ReactNode;
};

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-[var(--card-bg)] border-[var(--border)]',
  success: 'bg-[var(--success-bg)] border-[var(--success-border)]',
  warning: 'bg-[var(--warning-bg)] border-[var(--warning-border)]',
  danger: 'bg-[var(--danger-bg)] border-[var(--danger-border)]',
  info: 'bg-[var(--info-bg)] border-[var(--info-border)]',
};

export const Card = ({
  children,
  header,
  value,
  subtext,
  variant = 'default',
  className = '',
  icon,
}: CardProps) => {
  return (
    <div
      className={`rounded-xl border p-6 ${variantClasses[variant]} ${className}`}
    >
      {header && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
            {header}
          </h3>
          {icon && <div className="text-[var(--muted-foreground)]">{icon}</div>}
        </div>
      )}
      {value !== undefined && (
        <div className="text-3xl font-bold text-[var(--text-color)] mb-1">
          {value}
        </div>
      )}
      {subtext && (
        <p className="text-sm text-[var(--muted-foreground)]">{subtext}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

