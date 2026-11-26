'use client'

import type { JSX } from 'react'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Calendar, Search, X, ArrowLeft, Star, Eye, Sparkles, Award, Handshake, Cpu, Layers } from 'lucide-react'
import { PageShell } from '@/components/layout/PageShell'
import { BrandWordmark } from '@/components/ui/BrandWordmark'
import { news, type NewsItem } from '@/lib/data/news'
import { featuredMilestones, type FeaturedMilestone } from '@/lib/data/featured-milestones'
import { NewsDetailModal, type NewsModalItem } from '@/components/ui/NewsDetailModal'
import { ImageLightboxModal } from '@/components/ui/ImageLightboxModal'
import { formatDate, cn } from '@/lib/utils'
import { GradText } from '@/components/ui/SectionHeader'
import { fadeInUpVariants, staggerContainer, defaultViewport } from '@/lib/animations'

type NewsCategoryFilter = 'all' | 'featured' | 'awards' | 'partnerships' | 'technology'

export default function NewsPage(): JSX.Element {
  const [selectedNews, setSelectedNews] = useState<NewsModalItem | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<{
    title: string
    images: string[]
    initialIndex?: number
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<NewsCategoryFilter>('all')

  // Combine and sort all unique news items descending by date
  const sortedFeatured = useMemo(() => {
    return [...featuredMilestones].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [])

  const sortedAllNews = useMemo(() => {
    return [...news].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [])

  // Deep-link hash listener (#news/[id])
  useEffect(() => {
    const syncFromHash = () => {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const match = hash.match(/^#(?:news|milestones|updates)\/([^/?#]+)/i)
      if (match) {
        const targetId = match[1]
        const found =
          sortedAllNews.find((n) => n.id === targetId || n.id.includes(targetId)) ||
          sortedFeatured.find((f) => f.id === targetId || f.id.includes(targetId))
        if (found) {
          setSelectedNews(found)
          return
        }
      }
      if (
        hash === '#news' ||
        (!hash.startsWith('#news/') && !hash.startsWith('#milestones/'))
      ) {
        setSelectedNews(null)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [sortedAllNews, sortedFeatured])

  // Real-time filtering by category tab and search input
  const isSearching = searchQuery.trim().length > 0

  const filteredNews = useMemo(() => {
    let list: (NewsItem | FeaturedMilestone)[] = sortedAllNews

    if (activeCategory === 'featured') {
      list = sortedFeatured
    } else if (activeCategory === 'awards') {
      list = sortedAllNews.filter((item) => {
        const cat = item.category.toLowerCase()
        return cat.includes('award') || cat.includes('prize') || cat.includes('challenge') || cat.includes('top 50')
      })
    } else if (activeCategory === 'partnerships') {
      list = sortedAllNews.filter((item) => {
        const cat = item.category.toLowerCase()
        return cat.includes('partner') || cat.includes('nda') || cat.includes('strategic')
      })
    } else if (activeCategory === 'technology') {
      list = sortedAllNews.filter((item) => {
        const cat = item.category.toLowerCase()
        return cat.includes('poc') || cat.includes('prototype') || cat.includes('showcase') || cat.includes('summit')
      })
    }

    if (!isSearching) return list

    const q = searchQuery.toLowerCase().trim()
    return list.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q)
      )
    })
  }, [sortedAllNews, sortedFeatured, activeCategory, searchQuery, isSearching])

  const containerVariants = staggerContainer()
  const itemVariants = fadeInUpVariants

  return (
    <PageShell hideNavbar>
      <div className="relative pt-4 sm:pt-6 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-x-clip">
        {/* ── Ambient High-Tech Atmospheric Glows ───────────────────── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
          <div
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] sm:w-[1100px] h-[550px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(14,165,233,0.18) 0%, rgba(16,185,129,0.14) 38%, rgba(99,102,241,0.05) 65%, transparent 75%)',
            }}
          />
        </div>

        {/* Background Dot Matrix Texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
        />

        {/* ── Signature Floating Header Bar ── */}
        <div className="sticky top-3 sm:top-4 z-40 mb-8 sm:mb-10">
          <div className="flex items-center justify-between gap-2 sm:gap-6 max-w-7xl mx-auto rounded-full border border-sky-200/80 bg-white/95 px-3 py-1.5 sm:px-6 sm:py-2.5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] backdrop-blur-2xl transition-all duration-300 hover:border-emerald-400/80 hover:shadow-[0_12px_40px_rgba(16,185,129,0.16)]">
            {/* Left: Quick Back Navigation & Brand Wordmark */}
            <div className="flex items-center gap-1.5 sm:gap-3.5 shrink-0">
              <Link
                href="/#news"
                className="group inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-slate-100/90 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200/90 hover:border-sky-300 text-xs sm:text-[13px] font-bold shadow-2xs hover:shadow-xs transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label="Back to Homepage"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-600 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span className="hidden min-[380px]:inline">Back</span>
              </Link>

              <div className="h-4 w-px bg-slate-200 shrink-0" />

              <Link
                href="/"
                className="group flex items-center shrink-0 rounded-full py-0.5 transition-all duration-200 hover:-translate-y-0.5"
                aria-label="Back to NEVOLYN Home"
              >
                <BrandWordmark size="sm" />
              </Link>
            </div>

            {/* Right: Prominent Top-Bar Search Console */}
            <div className="w-full min-w-0 max-w-[150px] min-[390px]:max-w-[200px] min-[420px]:max-w-[240px] sm:max-w-md md:max-w-lg lg:max-w-xl ml-auto">
              <div className="group/search relative flex items-center rounded-full bg-white border-2 border-emerald-500/70 hover:border-emerald-500 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/20 px-2.5 sm:px-4 py-1.5 sm:py-2 transition-all duration-200 shadow-[0_2px_12px_rgba(16,185,129,0.12)]">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mr-1 sm:mr-1.5 transition-transform duration-200 group-hover/search:scale-110" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full min-w-0 bg-transparent text-xs sm:text-[13px] font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal placeholder:text-xs outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                    {news.length} Updates
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-10">
          {/* Glowing Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-sky-200/90 shadow-[0_2px_12px_rgba(56,189,248,0.12)] text-sky-800 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-md mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span>NEVOLYN · NEWS &amp; UPDATES</span>
          </div>

          {/* Main Title */}
          <motion.h1
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3"
          >
            News, Updates &amp; <GradText variant="sky">Breakthroughs</GradText>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-sm sm:text-base md:text-lg text-slate-700 font-bold max-w-2xl mx-auto leading-relaxed"
          >
            Official announcements, industrial partnerships and technology breakthroughs
          </motion.p>

          {/* ── Interactive Category Filter Tabs ─────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-6 sm:mt-7">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white/80 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All News ({sortedAllNews.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory('featured')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                activeCategory === 'featured'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-white/80 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200/80 hover:border-amber-300'
              )}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Featured News ({sortedFeatured.length})</span>
            </button>

            <button
              onClick={() => setActiveCategory('awards')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                activeCategory === 'awards'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-white/80 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300'
              )}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Awards &amp; Honors</span>
            </button>

            <button
              onClick={() => setActiveCategory('partnerships')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                activeCategory === 'partnerships'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'bg-white/80 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200/80 hover:border-sky-300'
              )}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Partnerships &amp; NDAs</span>
            </button>

            <button
              onClick={() => setActiveCategory('technology')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer',
                activeCategory === 'technology'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-white/80 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200/80 hover:border-indigo-300'
              )}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Tech &amp; Showcases</span>
            </button>
          </div>

          {/* Real-time search status indicator */}
          {isSearching && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs sm:text-sm text-slate-500 text-center mt-5"
            >
              Found <span className="font-bold text-emerald-700">{filteredNews.length}</span>{' '}
              {filteredNews.length === 1 ? 'article' : 'articles'} matching &ldquo;
              <span className="font-semibold text-slate-800">{searchQuery}</span>&rdquo;
            </motion.p>
          )}
        </div>

        {/* ── News Articles Grid ──────────────────────────────────── */}
        {filteredNews.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 max-w-7xl mx-auto"
          >
            {filteredNews.map((item, idx) => {
              const isGreen = idx % 3 === 0
              const isRed = idx % 3 === 1
              const barColor = isGreen
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent'
                : isRed
                  ? 'bg-gradient-to-r from-rose-400 via-orange-400 to-transparent'
                  : 'bg-gradient-to-r from-sky-400 via-indigo-400 to-transparent'
              const colorClasses = isGreen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 fill-emerald-600'
                : isRed
                  ? 'bg-rose-50 text-rose-700 border-rose-200 fill-rose-600'
                  : 'bg-sky-50 text-sky-700 border-sky-200 fill-sky-600'

              return (
                <motion.article
                  key={item.id}
                  variants={itemVariants}
                  className="h-[430px] sm:h-[470px] rounded-3xl overflow-hidden bg-white flex flex-col justify-between border border-slate-200 shadow-md hover:shadow-2xl hover:shadow-sky-500/15 hover:border-sky-300 hover:scale-[1.01] transition-all duration-300 relative group cursor-default select-none"
                >
                  {/* Top Colored Accent Bar */}
                  <div className={`absolute left-0 top-0 right-0 h-1 ${barColor} z-20`} />

                  {/* Thumbnail Image Header */}
                  {item.image && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPhoto({
                          title: item.title,
                          images: item.images && item.images.length > 0 ? item.images : [item.image],
                        })
                      }}
                      className="relative w-full h-48 sm:h-52 bg-slate-900 overflow-hidden cursor-zoom-in group/photo shrink-0"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover object-center group-hover/photo:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                      {/* Photo count indicator if gallery has multiple photos */}
                      {item.images && item.images.length > 1 && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/75 backdrop-blur-sm text-[10px] font-bold text-white border border-white/20">
                          +{item.images.length} Photos
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Dynamic Category & Date Header Row */}
                      <div className="flex items-center justify-between gap-2 mb-2 pt-0.5">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide border shadow-xs shrink-0',
                            colorClasses
                          )}
                        >
                          <Star className="w-3 h-3 shrink-0" />
                          <span className="whitespace-nowrap">{item.category}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-semibold shrink-0 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{formatDate(item.date)}</span>
                        </div>
                      </div>

                      {/* Title — On desktop/web clicking opens details modal; on mobile/touch only View Details button opens it */}
                      <h3
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.innerWidth < 1024) return
                          setSelectedNews(item)
                        }}
                        className="text-[13px] min-[390px]:text-sm sm:text-base font-bold text-slate-900 lg:hover:text-sky-600 transition-colors duration-200 tracking-tight leading-snug lg:cursor-pointer line-clamp-2 min-h-[2.5rem] sm:min-h-[2.75rem] mb-2"
                      >
                        {item.title}
                      </h3>

                      {/* Tagline / Short Description — Strictly 3 lines */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-2.5 font-normal text-justify cursor-default select-text line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Action Footer (Consistent full labels and leveled compact height) */}
                    <div className="pt-2 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2 w-full mt-auto">
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {item.linkedinUrl && (
                          <a
                            href={item.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="View on LinkedIn"
                            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 h-7 sm:h-[30px] rounded-full text-[10px] sm:text-[11px] font-semibold text-[#0a66c2] bg-white border border-[#0a66c2]/30 shadow-xs hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] active:bg-[#084e96] active:text-white transition-all duration-200 active:scale-95 shrink-0"
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            <span>LinkedIn</span>
                          </a>
                        )}

                        {item.facebookUrl && (
                          <a
                            href={item.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="View on Facebook"
                            className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 h-7 sm:h-[30px] rounded-full text-[10px] sm:text-[11px] font-semibold text-[#1877f2] bg-white border border-[#1877f2]/30 shadow-xs hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] active:bg-[#145dbf] active:text-white transition-all duration-200 active:scale-95 shrink-0"
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span>Facebook</span>
                          </a>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedNews(item)}
                        className="inline-flex items-center justify-center gap-1 sm:gap-1.5 h-7 sm:h-[30px] px-2.5 sm:px-3 rounded-full text-[10px] sm:text-[11px] font-semibold text-sky-700 bg-white hover:bg-sky-600 hover:text-white border border-sky-600/30 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0 ml-auto"
                      >
                        <Eye size={12} className="shrink-0" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16 px-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/60 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No announcements found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
              We couldn&apos;t find any articles matching your current search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('all')
              }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Pop-up Modal Window for View Details */}
      <NewsDetailModal
        item={selectedNews}
        isOpen={Boolean(selectedNews)}
        onClose={() => setSelectedNews(null)}
      />

      {/* Fullscreen Photo Lightbox */}
      <ImageLightboxModal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.title}
        images={selectedPhoto?.images || []}
        initialIndex={selectedPhoto?.initialIndex || 0}
      />
    </PageShell>
  )
}
