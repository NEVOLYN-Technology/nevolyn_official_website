'use client'

import { useRef, type JSX } from 'react'
import { X, Calendar, ExternalLink, Globe, Mail, ArrowLeft } from 'lucide-react'
import { formatDate, cn } from '@/lib/utils'
import { useModalHistory } from '@/lib/hooks/useModalHistory'

export interface NewsModalItem {
  id: string
  title: string
  description?: string
  content: string
  category: string
  date: string
  image?: string
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
 * Includes mobile-first back navigation, GPU-accelerated CSS animations,
 * and selected black state on hover and click for Back and Close buttons.
 */
export function NewsDetailModal({ item, isOpen, onClose }: NewsDetailModalProps): JSX.Element | null {
  const activeItemRef = useRef<NewsModalItem | null>(item)
  if (item) {
    activeItemRef.current = item
  }
  const currentItem = item || activeItemRef.current

  // Integrates browser history and pre-exit transition state
  const { handleClose, isClosing } = useModalHistory({
    isOpen: Boolean(isOpen && currentItem),
    onClose,
    modalId: 'news-detail',
    animationDuration: 180,
  })

  if (!isOpen && !isClosing) return null
  if (!currentItem) return null

  // Check if image is a portrait photo to style container appropriately
  const isPortrait = currentItem.image?.includes('photo')

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 lg:p-8 overscroll-contain"
    >
      {/* Backdrop Overlay */}
      <div
        onClick={handleClose}
        className={cn(
          'fixed inset-0 bg-slate-950/70 sm:backdrop-blur-md cursor-pointer',
          isClosing ? 'animate-backdrop-out' : 'animate-backdrop-in'
        )}
        aria-hidden="true"
      />

      {/* Modal Container with GPU-accelerated enter and exit animations */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative w-full h-[100dvh] sm:h-auto sm:max-w-2xl sm:max-h-[92vh] flex flex-col',
          'rounded-none sm:rounded-3xl bg-white shadow-2xl border-0 sm:border border-slate-200/90',
          'overflow-hidden z-10 overscroll-contain will-change-transform transform-gpu',
          isClosing ? 'animate-dialog-out' : 'animate-dialog-in'
        )}
      >
        {/* ── Sticky Top Navigation Bar ────────────────────────── */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shrink-0">
          {/* Category pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="truncate max-w-[220px] sm:max-w-xs">{currentItem.category}</span>
          </span>

          {/* Close Button with Selected Black State on Hover & Click */}
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close dialog"
            className={cn(
              'p-2 sm:p-2.5 rounded-full transition-all duration-200 cursor-pointer touch-manipulation active:scale-95 border border-transparent',
              isClosing
                ? 'bg-black text-white border-black scale-95'
                : 'text-slate-500 hover:bg-black hover:text-white hover:border-black active:bg-black active:text-white active:border-black'
            )}
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto no-scrollbar flex-1 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Hero Banner Header */}
          {currentItem.image && (
            <div className={`relative w-full overflow-hidden ${isPortrait ? 'h-60 sm:h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950' : 'h-52 sm:h-72 bg-slate-900'}`}>
              {/* Ambient background blur for portraits - desktop only to avoid GPU stall on mobile */}
              {isPortrait && (
                <img
                  src={currentItem.image}
                  alt=""
                  aria-hidden="true"
                  className="hidden sm:block absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-125 pointer-events-none"
                />
              )}

              <img
                src={currentItem.image}
                alt={currentItem.title}
                className={`relative z-10 w-full h-full transition-transform duration-700 hover:scale-105 ${
                  isPortrait ? 'object-contain py-3' : 'object-cover object-center'
                }`}
              />

              {/* Gradient shadow for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none z-10" />
            </div>
          )}

          {/* Main Body Content */}
          <div className="p-5 sm:p-8">
            {/* Meta details */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-semibold mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                <Calendar size={14} className="text-sky-500" />
                <span>{formatDate(currentItem.date)}</span>
              </div>
            </div>

            {/* Title */}
            <h3
              id="modal-title"
              className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug mb-4"
            >
              {currentItem.title}
            </h3>

            {/* Short preview highlight box */}
            {currentItem.description && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50/90 to-indigo-50/60 border border-sky-100/90 text-slate-800 text-sm sm:text-base font-semibold leading-relaxed mb-6 shadow-xs">
                {currentItem.description}
              </div>
            )}

            {/* Full Detailed Content with Hyperlinked Portals & Contact Cards */}
            <div className="text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
              {currentItem.content.split('\n\n').map((paragraph, index) => {
                const contact = parseContactBlock(paragraph)
                if (contact && (contact.website || contact.email)) {
                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/60 p-4 sm:p-5 shadow-xs transition-all hover:shadow-md hover:border-sky-300"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                          {contact.name}
                        </h4>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {contact.website && (
                          <a
                            href={contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-sky-200/90 text-sky-700 hover:text-white hover:bg-sky-600 hover:border-transparent font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-95 group"
                          >
                            <Globe size={15} className="text-sky-500 group-hover:text-white transition-colors" />
                            <span>{contact.website.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink size={13} className="opacity-70 group-hover:text-white" />
                          </a>
                        )}
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-emerald-200/90 text-emerald-700 hover:text-white hover:bg-emerald-600 hover:border-transparent font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 active:scale-95 group"
                          >
                            <Mail size={15} className="text-emerald-500 group-hover:text-white transition-colors" />
                            <span>{contact.email}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <p key={index} className="leading-relaxed whitespace-pre-line">
                    {renderInlineLinks(paragraph)}
                  </p>
                )
              })}
            </div>

            {/* Bottom Action Toolbar: Back Button & Social Links */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {currentItem.linkedinUrl && (
                  <a
                    href={currentItem.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0a66c2]/10 text-[#0a66c2] border border-[#0a66c2]/25 hover:bg-[#0a66c2] hover:text-white hover:border-[#0a66c2] active:bg-[#0a66c2] active:text-white transition-all duration-200 active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span>View on LinkedIn</span>
                    <ExternalLink size={13} className="opacity-80" />
                  </a>
                )}

                {currentItem.facebookUrl && (
                  <a
                    href={currentItem.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1877f2]/10 text-[#1877f2] border border-[#1877f2]/25 hover:bg-[#1877f2] hover:text-white hover:border-[#1877f2] active:bg-[#1877f2] active:text-white transition-all duration-200 active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>View on Facebook</span>
                    <ExternalLink size={13} className="opacity-80" />
                  </a>
                )}
              </div>

              {/* Prominent Back Button with Selected Black State on Hover & Click */}
              <button
                onClick={handleClose}
                type="button"
                className={cn(
                  'group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-xs touch-manipulation',
                  isClosing
                    ? 'bg-black text-white border-black scale-95'
                    : 'bg-slate-200 text-slate-700 border border-slate-300 hover:bg-black hover:text-white hover:border-black active:bg-black active:text-white active:border-black active:scale-95'
                )}
              >
                <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
                <span>Back to Updates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
