/**
 * Shared utility functions for the NEVOLYN Technology website.
 *
 * Provides conditional class merging (cn) and locale-pinned date formatting (formatDate).
 *
 * @module lib/utils
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines conditional CSS classes using `clsx` and resolves Tailwind class conflicts using `tailwind-merge`.
 *
 * @param inputs - List of class values, objects, arrays, or expressions
 * @returns Merged string of non-conflicting Tailwind classes
 *
 * @example
 * cn('px-4 py-2 bg-blue-500', isHovered && 'bg-blue-600', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats an ISO date string for display in International Standard format (e.g., 15 January 2026).
 *
 * Uses `en-GB` with day, month ('long'), and year options to ensure consistent Day Month Year
 * formatting across both server and client without hydration mismatch.
 *
 * @param isoDate - Valid ISO-8601 date string (e.g., '2026-07-03')
 * @param options - Optional DateTimeFormat overrides
 * @returns Formatted date string in Day Month Year format
 *
 * @example
 * formatDate('2026-07-03') // returns "3 July 2026"
 */
export function formatDate(isoDate: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }
  return new Date(isoDate).toLocaleDateString('en-GB', defaultOptions)
}
