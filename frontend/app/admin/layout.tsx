import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Operations Dashboard | NEVOLYN Technology',
  description: 'Executive administration, inquiries and candidate applications operations console.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
