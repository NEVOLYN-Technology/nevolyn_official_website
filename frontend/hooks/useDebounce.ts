"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any fast-changing value (e.g. search inputs).
 *
 * @param value The value to debounce.
 * @param delay The delay in milliseconds (default 300ms).
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
