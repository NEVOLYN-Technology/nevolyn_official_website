'use client'

/**
 * ThemeProvider — client-side context provider wrapper.
 *
 * ## Current State
 * The site is currently locked to **dark mode** by setting `className="dark"`
 * directly on the `<html>` element in `app/layout.tsx`. The `ThemeProvider`
 * is therefore a minimal pass-through that keeps the door open for a future
 * dynamic theme switcher without restructuring the component tree.
 *
 * ## How to add dynamic light/dark switching (future)
 * 1. Install `next-themes` (`pnpm add next-themes`).
 * 2. Replace the body of `Providers` with:
 *    ```tsx
 *    import { ThemeProvider } from 'next-themes'
 *    return (
 *      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
 *        {children}
 *      </ThemeProvider>
 *    )
 *    ```
 * 3. Remove `className="dark"` from `<html>` in `app/layout.tsx`.
 * 4. Add a theme toggle button to `Navbar.tsx`.
 *
 * @module components/providers/ThemeProvider
 */
import { ReactNode } from 'react'

/**
 * Root context provider wrapper.
 * Add all app-wide providers inside this component so `app/layout.tsx`
 * only imports one symbol (`<Providers>`) instead of every individual provider.
 */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
