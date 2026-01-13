'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success-light)] text-emerald-700',
  warning: 'bg-[var(--color-accent-light)] text-amber-700',
  error: 'bg-[var(--color-error-light)] text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size = 'md',
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center',
        'font-medium rounded-full',
        'whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// Specialized metric badge for displaying values with trends
interface MetricBadgeProps {
  label: string;
  value: string | number;
  trend?: number; // Positive = up, negative = down
  status?: 'good' | 'moderate' | 'poor';
}

export function MetricBadge({ label, value, trend, status }: MetricBadgeProps) {
  const statusColors = {
    good: 'text-emerald-600',
    moderate: 'text-amber-600',
    poor: 'text-red-600',
  };

  return (
    <div className="flex flex-col items-center px-3 py-2 bg-[var(--color-surface-secondary)] rounded-lg min-w-[80px]">
      <span className="text-micro text-[var(--color-text-muted)] uppercase tracking-wide">
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className={cn(
          'text-lg font-semibold',
          status ? statusColors[status] : 'text-[var(--color-text-primary)]'
        )}>
          {value}
        </span>
        {trend !== undefined && trend !== 0 && (
          <span className={cn(
            'text-xs font-medium',
            trend > 0 ? 'text-emerald-500' : 'text-red-500'
          )}>
            {trend > 0 ? '+' : ''}{trend}
          </span>
        )}
      </div>
    </div>
  );
}

export default Badge;
