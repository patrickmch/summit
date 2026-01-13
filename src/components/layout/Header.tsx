'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  /** Small text above the title (e.g., "Week 3 of 8") */
  subtitle?: string;
  /** Main title text (e.g., "Base Building") */
  title: string;
  /** Right-side content (e.g., avatar, actions) */
  rightContent?: ReactNode;
  /** Additional bottom content (e.g., date display) */
  bottomContent?: ReactNode;
  /** Whether to use dark styling */
  variant?: 'dark' | 'light';
  className?: string;
}

export function Header({
  subtitle,
  title,
  rightContent,
  bottomContent,
  variant = 'dark',
  className,
}: HeaderProps) {
  const isDark = variant === 'dark';

  return (
    <header
      className={cn(
        'px-4 pt-4 pb-4',
        'safe-top',
        isDark
          ? 'bg-[var(--color-header-bg)] text-[var(--color-header-text)]'
          : 'bg-[var(--color-surface)]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {subtitle && (
            <p
              className={cn(
                'text-caption',
                isDark ? 'text-slate-400' : 'text-[var(--color-text-muted)]'
              )}
            >
              {subtitle}
            </p>
          )}
          <h1
            className={cn(
              'text-title truncate',
              isDark ? 'text-white' : 'text-[var(--color-text-primary)]'
            )}
          >
            {title}
          </h1>
        </div>
        {rightContent && (
          <div className="flex-shrink-0 ml-4">{rightContent}</div>
        )}
      </div>
      {bottomContent && <div className="mt-2">{bottomContent}</div>}
    </header>
  );
}

// Avatar component for the header
interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div
      className={cn(
        'rounded-full bg-[var(--color-accent)] text-white',
        'flex items-center justify-center font-medium',
        'overflow-hidden',
        sizeClasses[size]
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

export default Header;
