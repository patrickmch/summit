'use client';

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const defaultHeight = variant === 'text' ? '1em' : undefined;
  const defaultWidth = variant === 'circular' ? height : '100%';

  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--color-surface-secondary)]',
        variantStyles[variant],
        className
      )}
      style={{
        width: width ?? defaultWidth,
        height: height ?? defaultHeight,
        ...style,
      }}
      {...props}
    />
  );
}

// Predefined skeleton patterns
export function SkeletonCard() {
  return (
    <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
      <Skeleton variant="text" height={24} width="60%" className="mb-2" />
      <Skeleton variant="text" height={16} width="40%" className="mb-4" />
      <Skeleton variant="rectangular" height={80} className="mb-4" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height={40} width={100} />
        <Skeleton variant="rectangular" height={40} width={100} />
      </div>
    </div>
  );
}

export function SkeletonMetricsStrip() {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide p-1">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rectangular" width={80} height={60} />
      ))}
    </div>
  );
}

export function SkeletonWorkoutBlock() {
  return (
    <div className="p-3 bg-[var(--color-surface-secondary)] rounded-lg">
      <div className="flex justify-between mb-2">
        <Skeleton variant="text" height={18} width="50%" />
        <Skeleton variant="text" height={18} width={40} />
      </div>
      <Skeleton variant="text" height={14} width="30%" />
    </div>
  );
}

export default Skeleton;
