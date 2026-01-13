'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-caption font-medium text-[var(--color-text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-11 px-3 rounded-lg',
              'bg-[var(--color-surface)]',
              'border border-[var(--color-border)]',
              'text-[var(--color-text-primary)] text-body',
              'placeholder:text-[var(--color-text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
              'transition-shadow duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : '',
              icon ? 'pl-10' : '',
              className
            )}
            {...props}
          />
        </div>
        {(error || hint) && (
          <p className={cn(
            'mt-1.5 text-caption',
            error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'
          )}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-caption font-medium text-[var(--color-text-primary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2.5 rounded-lg',
            'bg-[var(--color-surface)]',
            'border border-[var(--color-border)]',
            'text-[var(--color-text-primary)] text-body',
            'placeholder:text-[var(--color-text-muted)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent',
            'transition-shadow duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none',
            error ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]' : '',
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p className={cn(
            'mt-1.5 text-caption',
            error ? 'text-[var(--color-error)]' : 'text-[var(--color-text-muted)]'
          )}>
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
