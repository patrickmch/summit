'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { BottomNav } from './BottomNav';

interface PageShellProps {
  /** Page content */
  children: ReactNode;
  /** Header element (rendered at top) */
  header?: ReactNode;
  /** Whether to show the bottom navigation */
  showNav?: boolean;
  /** Whether to add padding at bottom for nav */
  padForNav?: boolean;
  /** Background color variant */
  background?: 'default' | 'secondary';
  /** Additional className */
  className?: string;
}

export function PageShell({
  children,
  header,
  showNav = true,
  padForNav = true,
  background = 'secondary',
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        background === 'secondary'
          ? 'bg-[var(--color-surface-secondary)]'
          : 'bg-[var(--color-surface)]'
      )}
    >
      {header}
      <main
        className={cn(
          'flex-1',
          padForNav && showNav && 'pb-nav',
          className
        )}
      >
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}

// Content container for consistent padding
interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export function ContentContainer({ children, className }: ContentContainerProps) {
  return (
    <div className={cn('px-4 py-4', className)}>
      {children}
    </div>
  );
}

// Full-height flex container (useful for chat)
interface FullHeightContainerProps {
  children: ReactNode;
  className?: string;
}

export function FullHeightContainer({ children, className }: FullHeightContainerProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {children}
    </div>
  );
}

export default PageShell;
