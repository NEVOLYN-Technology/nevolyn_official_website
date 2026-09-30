import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * Metadata configuration for NEVOLYN Careers & Join Us page.
 *
 * Targeted specifically for user search queries:
 * - "nevolyn career", "career nevolyn", "nevolyn careers", "careers nevolyn"
 * - "job nevolyn", "nevolyn job", "jobs nevolyn", "nevolyn jobs"
 * - "vacancy nevolyn", "nevolyn vacancy", "nevolyn vacancies"
 * - "nevolyn join us", "join us nevolyn", "join nevolyn"
 * - "nevolyn career search", "nevolyn hiring", "nevolyn recruitment"
 */
export const metadata: Metadata = {
  title: {
    absolute: 'Careers | NEVOLYN',
  },
  description:
    'Explore NEVOLYN career opportunities, job vacancies, and engineering internships. Apply to join our deep-tech team building industrial robotics, AI systems, and automation software in Dhaka, Bangladesh.',
  keywords: [
    'nevolyn career',
    'career nevolyn',
    'job nevolyn',
    'nevolyn job',
    'vacancy nevolyn',
    'nevolyn vacancy',
    'nevolyn vacancies',
    'nevolyn career search',
    'nevolyn careers',
    'careers nevolyn',
    'jobs nevolyn',
    'nevolyn jobs',
    'nevolyn join us',
    'join us nevolyn',
    'join nevolyn',
    'nevolyn recruitment',
    'nevolyn hiring',
    'nevolyn job circular',
    'nevolyn circular',
    'nevolyn software engineer job',
    'nevolyn ai engineer job',
    'nevolyn automation engineer job',
    'nevolyn internship',
    'nevolyn tech jobs',
    'নেভোলিন ক্যারিয়ার',
    'নেভোলিন চাকরি',
    'নেভোলিন জব',
    'নেভোলিন নিয়োগ',
    'নেভোলিন সার্কুলার',
    'নেভোলিন ক্যারিয়ার সার্চ',
  ],
  alternates: {
    canonical: 'https://nevolyn.com/join_us',
  },
  openGraph: {
    title: 'Careers | NEVOLYN',
    description:
      'Explore NEVOLYN career opportunities, job vacancies, and engineering internships. Apply to join our deep-tech team building industrial robotics, AI systems, and automation software in Dhaka, Bangladesh.',
    url: 'https://nevolyn.com/join_us',
    siteName: 'NEVOLYN',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Careers | NEVOLYN',
    description:
      'Explore NEVOLYN career opportunities, job vacancies, and engineering internships. Apply to join our deep-tech team building industrial robotics, AI systems, and automation software in Dhaka, Bangladesh.',
  },
}

export default function JoinUsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
