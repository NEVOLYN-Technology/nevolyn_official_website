/**
 * LatestNewsSection — latest news and announcements, shown on the homepage.
 *
 * Reads from `lib/data/latest-news.ts` (the single source of truth for all news).
 * News items with `featured: true` are rendered in a larger 2-column card
 * grid at the top ("Featured"). All other items render as a compact list
 * below ("Recent Updates").
 *
 * ## How to add a news item
 * Edit `lib/data/latest-news.ts` — do NOT hard-code news data here.
 * Set `featured: true` to promote an item into the featured grid.
 *
 * ## Future: Article detail pages
 * The `NewsItem` type already has a `content` field for full body copy.
 * When article detail pages are added (`app/news/[id]/page.tsx`), each
 * card/row should become a `<Link href={/news/${item.id}}>` wrapper.
 *
 * @module components/sections/LatestNewsSection
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'
import { Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { news } from '@/lib/data/latest-news'
import { fadeLeftProps, fadeUpProps } from '@/lib/animations'
import { formatDate } from '@/lib/utils'

/**
 * News timeline section rendering featured project announcements and recent institutional updates.
 *
 * @returns Rendered news section component
 */
export const LatestNewsSection = (): JSX.Element => {
  const sortedNews = [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const featuredNews = sortedNews.filter((item) => item.featured)
  const otherNews = sortedNews.filter((item) => !item.featured)

  return (
    <section id="latest-news" className="py-12 bg-slate-50 dark:bg-[#0a1526]/30 border-t border-slate-200 dark:border-blue-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-500 uppercase">Latest News &amp; Milestones</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Official updates, funding announcements, and technology breakthroughs from Saturn R&amp;D</p>
        </div>

        {/* Featured News Grid */}
        {featuredNews.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              Featured Milestones
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredNews.map((item, idx) => (
                <motion.div
                  key={item.id}
                  {...fadeUpProps(idx * 0.05)}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="group cursor-pointer p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0a1526] border border-slate-200 dark:border-blue-950/60 hover-border-blink transition-all duration-300 shadow-xl dark:shadow-none flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <Badge tone="warning" className="px-3 py-1 text-xs font-semibold">
                        ★ Featured {item.category}
                      </Badge>
                      <span className="text-xs text-orange-500 font-semibold">{formatDate(item.date)}</span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-extrabold mb-3 text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <User size={14} className="text-orange-500" />
                    {item.author}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Updates List */}
        <div>
          <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Recent Updates</h3>
          <div className="space-y-4">
            {otherNews.map((item, idx) => (
              <motion.div
                key={item.id}
                {...fadeLeftProps(idx * 0.05)}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-6 rounded-2xl bg-white dark:bg-[#0a1526]/60 border border-slate-200 dark:border-slate-800/60 hover-border-blink transition-all duration-300 group cursor-pointer shadow-sm dark:shadow-none"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold mb-1 text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{item.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{item.description}</p>
                  </div>
                  <Badge tone="info" className="ml-4">
                    {item.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(item.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    {item.author}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
