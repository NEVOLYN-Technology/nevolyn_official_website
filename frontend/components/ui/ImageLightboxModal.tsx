'use client'

import type { JSX } from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useModalHistory } from '@/lib/hooks/useModalHistory'

export interface ImageLightboxModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  images: string[]
  initialIndex?: number
  onIndexChange?: (newIndex: number) => void
}

/**
 * Zero-Lag Fullscreen Photo Lightbox.
 *
 * Implements strict zero-lag architecture:
 * - Pure React state + useModalHistory integration for instant mobile back-button/gesture dismissal
 * - Ultra-lightweight hardware-accelerated Framer Motion fade (duration: 0.12s, easeOut)
 * - Solid high-performance backdrop without expensive backdrop-filter blur
 * - Clicking anywhere outside the photo takes the user back instantly on the first tap
 * - Safe area inset padding and 48px touch target for the close button
 * - Clean separation between touch swiping and backdrop tap detection
 * - Photo title, counter ("Photo X of Y"), and indicator dots placed below the photo
 * - Responsive typography (smaller title version on mobile/tablet)
 * - Touch-pan horizontal CSS scroll snap without artificial browser easing
 * - Synchronizes active index changes back to parent via `onIndexChange`
 */
export function ImageLightboxModal({
  isOpen,
  onClose,
  title,
  images,
  initialIndex = 0,
  onIndexChange,
}: ImageLightboxModalProps): JSX.Element | null {
  const lastValidImagesRef = useRef<string[]>([])
  if (images && images.length > 0) {
    lastValidImagesRef.current = images
  }
  const displayImages = images && images.length > 0 ? images : lastValidImagesRef.current
  const isMultiple = displayImages.length > 1

  // Integrates browser history so phone back button / edge swipe closes the lightbox smoothly
  const { handleClose } = useModalHistory({
    isOpen: Boolean(isOpen && displayImages.length > 0),
    onClose,
    modalId: 'image-lightbox',
  })

  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isFirstOpenRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 })
  const isDraggingRef = useRef(false)

  // Initialize active photo ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen) {
      if (!isFirstOpenRef.current) {
        isFirstOpenRef.current = true
        const targetIndex = Math.max(0, Math.min(initialIndex, displayImages.length - 1))
        setCurrentIndex(targetIndex)
        requestAnimationFrame(() => {
          const el = scrollRef.current
          if (el) {
            el.scrollLeft = targetIndex * el.clientWidth
          }
        })
      }
    } else {
      isFirstOpenRef.current = false
    }
  }, [isOpen, initialIndex, displayImages.length])

  // Track pointer gestures to distinguish true swipes from quick taps
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() }
    isDraggingRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
    if (dx > 20 || dy > 20) {
      isDraggingRef.current = true
    }
  }

  // Dismiss modal on backdrop / outside clicks unless user was swiping photos
  const handleBackdropClick = (e: React.MouseEvent) => {
    // If the click is inside the photo or caption, do not close
    if ((e.target as HTMLElement).closest('[data-lightbox-photo]')) {
      return
    }

    const elapsed = Date.now() - pointerStartRef.current.time
    // If user was actively dragging/swiping across photos for > 250ms, do not close
    if (isDraggingRef.current && elapsed > 250) {
      isDraggingRef.current = false
      return
    }

    isDraggingRef.current = false
    handleClose()
  }

  // Real-time horizontal scroll tracking
  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width)
      if (newIndex >= 0 && newIndex < displayImages.length && newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    }
  }, [displayImages.length, currentIndex, onIndexChange])

  // Scroll to a specific photo index
  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const targetLeft = index * el.clientWidth
    el.scrollTo({ left: targetLeft, behavior: 'smooth' })
    setCurrentIndex(index)
    onIndexChange?.(index)
  }, [onIndexChange])

  // Keyboard navigation (ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.stopPropagation()
        if (currentIndex > 0) {
          scrollToIndex(currentIndex - 1)
        }
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation()
        if (currentIndex < displayImages.length - 1) {
          scrollToIndex(currentIndex + 1)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, displayImages.length, scrollToIndex])

  return (
    <AnimatePresence>
      {isOpen && displayImages.length > 0 && (
        <motion.div
          key="image-lightbox-modal"
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Photo Lightbox'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: 'none' }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 text-white select-none overscroll-contain cursor-pointer touch-manipulation"
        >
          {/* Floating Top-Right Close Button with Safe Area Insets & 48px touch target */}
          <div className="absolute top-0 right-0 p-3 sm:p-5 z-40 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              aria-label="Close photo lightbox"
              className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-slate-300 hover:text-white bg-black/60 hover:bg-black/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-lg touch-manipulation"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
            </button>
          </div>

          {/* Scrollable Photos Carousel with CSS Scroll Snapping (Clicking anywhere outside photo closes lightbox) */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="relative w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain cursor-pointer"
          >
            {displayImages.map((src, idx) => (
              <div
                key={idx}
                className="w-full h-full shrink-0 snap-center snap-always flex flex-col items-center justify-center p-3 sm:p-6 cursor-pointer"
              >
                {/* Photo & Caption Group: Centers photo and places caption just below it */}
                <div data-lightbox-photo className="flex flex-col items-center max-w-full">
                  {/* Photo Image - Clicking the photo itself does NOT close */}
                  <img
                    src={src}
                    alt={title ? `${title} - Photo ${idx + 1}` : `Photo ${idx + 1}`}
                    onClick={(e) => e.stopPropagation()}
                    className="max-w-[96vw] lg:max-w-[92vw] max-h-[66vh] lg:max-h-[74vh] object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default select-none"
                  />

                  {/* Photo Caption & Counter: Positioned IMMEDIATELY below photo */}
                  <div className="mt-2 lg:mt-2.5 flex flex-col items-center justify-center gap-1 lg:gap-1.5 text-center max-w-2xl px-2">
                    {/* Photo Name & Counter Row: stacked on mobile/iPad vertical, inline on iPad horizontal/web */}
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2.5">
                      {/* Photo Name: just below photo, smaller version on mobile & iPad vertical */}
                      {title && (
                        <h4
                          title={title}
                          className="text-[11px] min-[360px]:text-xs lg:text-base font-medium text-slate-200 line-clamp-1 lg:line-clamp-2 max-w-[90vw] lg:max-w-xl text-center"
                        >
                          {title}
                        </h4>
                      )}

                      {/* Counter: Photo X of Y */}
                      <span className="shrink-0 px-2 lg:px-2.5 py-0.5 rounded-full text-[10px] min-[360px]:text-[11px] lg:text-xs font-semibold bg-white/20 text-slate-200 border border-white/10 tracking-wide">
                        Photo {idx + 1} of {displayImages.length}
                      </span>
                    </div>

                    {/* Interactive Indicator Dots */}
                    {isMultiple && (
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        {displayImages.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              scrollToIndex(dotIdx)
                            }}
                            aria-label={`Jump to photo ${dotIdx + 1}`}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              dotIdx === currentIndex
                                ? 'w-4 bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                                : 'w-1.5 bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          {isMultiple && currentIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                scrollToIndex(currentIndex - 1)
              }}
              aria-label="Previous photo"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Right Arrow Button */}
          {isMultiple && currentIndex < displayImages.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                scrollToIndex(currentIndex + 1)
              }}
              aria-label="Next photo"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
