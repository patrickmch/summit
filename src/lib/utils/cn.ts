/**
 * Utility for conditionally joining class names
 * Lightweight alternative to clsx/classnames libraries
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x): x is string | number => Boolean(x) && typeof x !== 'boolean')
    .map(String)
    .join(' ');
}
