'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'

/**
 * Root context provider wrapper.
 * Add all app-wide providers inside this component so `app/layout.tsx`
 * only imports one symbol (`<Providers>`) instead of every individual provider.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
