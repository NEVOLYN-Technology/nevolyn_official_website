'use client'

import { useState, useRef, useEffect, useCallback, useMemo, type JSX } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Calendar,
  ExternalLink,
  Globe,
  Mail,
  ArrowLeft,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Images,
} from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { useModalHistory } from '@/lib/hooks/useModalHistory'
import { ImageLightboxModal } from '@/components/ui/ImageLightboxModal'

export interface NewsModalItem {
  id: string
  title: string
  description?: string
  content: string
  category: string
  date: string
  image?: string
  secondaryImage?: string
  images?: string[]
  linkedinUrl?: string
  facebookUrl?: string
}

interface NewsDetailModalProps {
  item: NewsModalItem | null
  isOpen: boolean
  onClose: () => void
}

/**
 * Helper to auto-link plain URLs and email addresses in regular text paragraphs
 */
function renderInlineLinks(text: string): (string | JSX.Element)[] {
  const urlOrEmailRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
  const parts = text.split(urlOrEmailRegex)

  return parts.map((part, idx) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold text-sky-600 hover:text-sky-800 underline underline-offset-2 transition-colors break-all"
        >
          <span>{part.replace(/^https?:\/\//, '')}</span>
          <ExternalLink size={12} className="shrink-0" />
        </a>
      )
    }
    if (part.includes('@') && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part)) {
      return (
        <a
          key={idx}
          href={`mailto:${part}`}
          className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2 transition-colors"
        >
          <Mail size={12} className="shrink-0" />
          <span>{part}</span>
        </a>
      )
    }
    return part
  })
}

/**
 * Checks if a paragraph is a contact/organization signature block
 */
function parseContactBlock(text: string) {
  const lower = text.toLowerCase()
  const hasWebsite = lower.includes('website:') || lower.includes('http://') || lower.includes('https://')
  const hasEmail = lower.includes('email:') || lower.includes('@nevolyn.com') || lower.includes('@')

  if (!hasWebsite && !hasEmail) return null

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  let name = lines[0] || 'Official Portal'
  let website = ''
  let email = ''

  for (const line of lines) {
    const webMatch = line.match(/https?:\/\/[^\s]+/i)
    if (webMatch) website = webMatch[0]

    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i)
    if (emailMatch) email = emailMatch[0]
  }

  if (name.toLowerCase().startsWith('website:') || name.toLowerCase().startsWith('email:')) {
    name = 'Official Portal'
  }

  return { name, website, email }
}

/**
 * Premium pop-up modal window displaying the full news details, photo,
 * and direct links to LinkedIn and Facebook.
 * Supports multi-image swipe/scroll and switching between main show and detail views.
 */
export function NewsDetailModal({ item, isOpen, onClose }: NewsDetailModalProps): JSX.Element | null {
  // Integrates browser history so phone back button / edge swipe closes the modal smoothly
  const { handleClose } = useModalHistory({
    isOpen: Boolean(isOpen && item),
    onClose,
    modalId: 'news-detail',
  })

  // State for opening full uncropped photo in Lightbox
  const [isPhotoOpen, setIsPhotoOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const heroScrollRef = useRef<HTMLDivElement>(null)

  // Construct complete gallery list in deterministic order: [main, secondary1, secondary2, ...]
  const modalImages: string[] = item
    ? item.images && item.images.length > 0
      ? item.images
      : [item.image, item.secondaryImage].filter((img): img is string => Boolean(img))
    : []

  // Reset to first photo whenever opened or item changes
  useEffect(() => {
    setActiveImageIndex(0)
    const el = heroScrollRef.current
    if (el) {
      el.scrollLeft = 0
    }
  }, [item?.id, isOpen])

  // Sync active index with horizontal scroll position
  const handleHeroScroll = useCallback(() => {
    const el = heroScrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width)
      if (newIndex >= 0 && newIndex < modalImages.length && newIndex !== activeImageIndex) {
        setActiveImageIndex(newIndex)
      }
    }
  }, [modalImages.length, activeImageIndex])

  // Smooth-scroll the hero container to specific image index
  const scrollToHeroImage = useCallback((index: number) => {
    const el = heroScrollRef.current
    if (!el) return
    const targetLeft = index * el.clientWidth
    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
    setActiveImageIndex(index)
  }, [])

  // Memoize paragraph splitting and contact parsing so exit animation runs at 60fps without CPU spikes
  const parsedParagraphs = useMemo(() => {
    if (!item) return []
    return item.content.split('\n\n').map((paragraph) => ({
      contact: parseContactBlock(paragraph),
      text: paragraph,
    }))
  }, [item])

  if (!item) return null

  const isMultiple = modalImages.length > 1

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-8 overscroll-contain">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm sm:backdrop-blur-md cursor-pointer"
              aria-hidden="true"
            />

            {/* Dialog panel: Fullscreen on mobile & iPad vertical, floating centered dialog on iPad horizontal & web */}
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative w-full h-[100dvh] lg:h-auto lg:max-w-2xl lg:max-h-[92vh] flex flex-col rounded-none lg:rounded-3xl bg-white shadow-2xl border-0 lg:border border-slate-200/90 overflow-hidden z-10 overscroll-contain"
            >
              {/* ── Sticky Top Navigation Bar ────────────────── */}
              <div className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-2.5 lg:py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
                {/* Category pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] lg:text-xs font-black tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-200/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span className="truncate max-w-[200px] lg:max-w-xs">{item.category}</span>
                </span>

                {/* Prominent Close Button */}
                <button
                  onClick={handleClose}
                  type="button"
                  aria-label="Close dialog"
                  className="p-2 lg:p-2.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 cursor-pointer touch-manipulation active:scale-95"
                >
                  <X className="w-6 h-6 lg:w-7 lg:h-7 stroke-[2.2]" />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="overflow-y-auto no-scrollbar flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
                {/* Hero Banner Header: Swipeable / Scrollable horizontally for multiple images */}
                {modalImages.length > 0 && (
                  <div className="relative w-full h-56 lg:h-72 overflow-hidden bg-slate-950 select-none">
                    {/* Horizontal Scroll Track with Snapping */}
                    <div
                      ref={heroScrollRef}
                      onScroll={handleHeroScroll}
                      className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth"
                    >
                      {modalImages.map((imgSrc, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveImageIndex(idx)
                            setIsPhotoOpen(true)
                          }}
                          title="Click to view full uncropped photo"
                          className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center relative cursor-zoom-in group"
                        >
                          <img
                            src={imgSrc}
                            alt={`${item.title} photo ${idx + 1}`}
                            className="w-full h-full object-contain p-2 sm:p-3 group-hover:scale-[1.02] transition-transform duration-300 pointer-events-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Gradient shadow for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none z-10" />

                    {/* Prev / Next buttons for multi-image gallery */}
                    {isMultiple && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            const prev = activeImageIndex > 0 ? activeImageIndex - 1 : modalImages.length - 1
                            scrollToHeroImage(prev)
                          }}
                          aria-label="Previous photo"
                          className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-sky-600 active:bg-sky-700 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            const next = activeImageIndex < modalImages.length - 1 ? activeImageIndex + 1 : 0
                            scrollToHeroImage(next)
                          }}
                          aria-label="Next photo"
                          className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-slate-900/80 hover:bg-sky-600 active:bg-sky-700 text-white backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                        </button>
                      </>
                    )}

                    {/* Multi-photo indicator pills with clickable dots */}
                    {isMultiple && (
                      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow-md">
                        <span>Photo {activeImageIndex + 1} of {modalImages.length}</span>
                        <div className="flex items-center gap-1 ml-1">
                          {modalImages.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                scrollToHeroImage(i)
                              }}
                              aria-label={`Jump to photo ${i + 1}`}
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                                i === activeImageIndex ? "w-3.5 bg-sky-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full photo view badge */}
                    <div
                      onClick={() => setIsPhotoOpen(true)}
                      className="absolute bottom-3 right-3 z-20 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-md hover:bg-sky-600 transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Full Photo</span>
                    </div>
                  </div>
                )}

                {/* Main Body Content */}
                <div className="p-5 lg:p-8">
                  {/* Meta details */}
                  <div className="flex items-center gap-2 text-xs lg:text-sm text-slate-500 font-semibold mb-3">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      <Calendar size={14} className="text-sky-500" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    id="modal-title"
                    className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-4"
                  >
                    {item.title}
                  </h3>

                  {/* Short preview highlight box */}
                  {item.description && (
                    <div className="p-4 lg:p-5 rounded-2xl bg-gradient-to-r from-sky-50/90 to-indigo-50/60 border border-sky-100/90 text-slate-800 text-sm lg:text-base font-semibold leading-relaxed mb-6 shadow-xs">
                      {item.description}
                    </div>
                  )}

                  {/* Multi-Photo Gallery */}
                  {isMultiple && (
                    <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200/90 shadow-xs">
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <Images className="w-4 h-4 text-sky-600" />
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                            Event Gallery ({modalImages.length} Photos)
                          </h4>
                        </div>
                        <span className="text-[11px] sm:text-xs text-slate-500 font-semibold">
                          Tap to enlarge or switch
                        </span>
                      </div>

                      <div className={cn(
                        "grid gap-2.5 sm:gap-3.5",
                        modalImages.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2"
                      )}>
                        {modalImages.map((imgSrc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              scrollToHeroImage(idx)
                              setIsPhotoOpen(true)
                            }}
                            className={cn(
                              "group relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 border-2 text-left transition-all duration-200 aspect-[16/10] cursor-pointer shadow-xs active:scale-[0.98]",
                              activeImageIndex === idx
                                ? "border-sky-500 ring-2 ring-sky-400/40 shadow-md"
                                : "border-slate-200/90 hover:border-sky-300"
                            )}
                          >
                            <img
                              src={imgSrc}
                              alt={`${item.title} photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold">
                              <span className="truncate">
                                {idx === 0 ? 'Photo 1 • Main' : modalImages.length === 2 ? 'Photo 2 • Detail' : `Photo ${idx + 1}`}
                              </span>
                              <Maximize2 size={12} className="opacity-80 group-hover:opacity-100 shrink-0 ml-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Detailed Content with Hyperlinked Portals & Contact Cards */}
                  <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
                    {parsedParagraphs.map(({ contact, text }, index) => {
                      if (contact && (contact.website || contact.email)) {
                        return (
                          <div
                            key={index}
                            className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/60 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-sky-300"
                          >
                            <div className="flex items-center gap-2 mb-2.5 sm:mb-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse shrink-0" />
                              <h4 className="font-extrabold text-slate-900 text-xs sm:text-base tracking-tight truncate">
                                {contact.name}
                              </h4>
                            </div>

                            <div
                              className={`grid gap-1.5 sm:gap-2.5 w-full ${
                                contact.website && contact.email ? 'grid-cols-2' : 'grid-cols-1'
                              }`}
                            >
                              {contact.email && (
                                <a
                                  href={`mailto:${contact.email}`}
                                  title={contact.email}
                                  onClick={(e) => e.stopPropagation()}
                                  className="min-w-0 w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-xl bg-white border border-emerald-200/90 text-emerald-700 hover:text-white hover:bg-emerald-600 hover:border-transparent font-bold text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm shadow-xs transition-all duration-200 active:scale-95 group overflow-hidden"
                                >
                                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-emerald-500 group-hover:text-white transition-colors" />
                                  <span className="truncate">{contact.email}</span>
                                </a>
                              )}
                              {contact.website && (
                                <a
                                  href={contact.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={contact.website}
                                  onClick={(e) => e.stopPropagation()}
                                  className="min-w-0 w-full flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-2 rounded-xl bg-white border border-sky-200/90 text-sky-700 hover:text-white hover:bg-sky-600 hover:border-transparent font-bold text-[10px] min-[360px]:text-[11px] sm:text-xs md:text-sm shadow-xs transition-all duration-200 active:scale-95 group overflow-hidden"
                                >
                                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-sky-500 group-hover:text-white transition-colors" />
                                  <span className="truncate">{contact.website.replace(/^https?:\/\//, '')}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover:text-white hidden min-[440px]:inline-block sm:inline-block" />
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      }

                      return (
                        <p key={index} className="leading-relaxed whitespace-pre-line">
                          {renderInlineLinks(text)}
                        </p>
                      )
                    })}
                  </div>

                  {/* Bottom Action Toolbar: Back Button & Social Links */}
                  <div className="pt-4 lg:pt-6 border-t border-slate-100 flex items-center justify-between gap-2 lg:gap-3">
                    <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0">
                      {item.linkedinUrl && (
                        <a
                          href={item.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View on LinkedIn"
                          className="inline-flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold bg-white text-[#0a66c2] border border-[#0a66c2]/30 hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] active:bg-[#084e96] active:text-white transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                        >
                          <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          <span>
                            <span className="hidden lg:inline">View on </span>LinkedIn
                          </span>
                          <ExternalLink size={12} className="opacity-80 shrink-0 hidden lg:inline" />
                        </a>
                      )}

                      {item.facebookUrl && (
                        <a
                          href={item.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View on Facebook"
                          className="inline-flex items-center justify-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-full text-xs lg:text-sm font-semibold bg-white text-[#1877f2] border border-[#1877f2]/30 hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] active:bg-[#145dbf] active:text-white transition-all duration-200 active:scale-95 shadow-xs shrink-0"
                        >
                          <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>
                            <span className="hidden lg:inline">View on </span>Facebook
                          </span>
                          <ExternalLink size={12} className="opacity-80 shrink-0 hidden lg:inline" />
                        </a>
                      )}
                    </div>

                    {/* Prominent Back Button */}
                    <button
                      onClick={handleClose}
                      type="button"
                      className="group inline-flex items-center justify-center gap-1.5 lg:gap-2 px-3.5 lg:px-5 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-bold bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md hover:shadow-slate-900/20 active:bg-black active:text-white transition-all duration-200 active:scale-95 shadow-xs cursor-pointer shrink-0"
                    >
                      <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1 shrink-0" />
                      <span className="hidden lg:inline">Back to Updates</span>
                      <span className="lg:hidden">Back</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Zero-Lag Fullscreen Photo Lightbox Modal */}
      <ImageLightboxModal
        isOpen={isPhotoOpen}
        onClose={() => setIsPhotoOpen(false)}
        title={item.title}
        images={modalImages}
        initialIndex={activeImageIndex}
        onIndexChange={(newIdx) => {
          setActiveImageIndex(newIdx)
          scrollToHeroImage(newIdx)
        }}
      />
    </>
  )
}

