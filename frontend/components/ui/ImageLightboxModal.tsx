'use client'

import type { JSX } from 'react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export interface ImageLightboxModalProps {
  isOpen?: boolean
  onClose: () => void
  title?: string
  image?: string
  images?: string[]
  initialIndex?: number
  alt?: string
  onIndexChange?: (newIndex: number) => void
}

/**
 * ImageLightboxModal — High-performance full-screen uncropped photo viewer.
 *
 * Designed for 0ms latency and 60fps on mobile.
 * Decouples router state from lightbox: secondary photo viewing remains pure React state.
 *
 * UX Requirements:
 * 1. Anywhere outside the photo click dismisses the lightbox.
 * 2. Gesture disambiguation: horizontal swipe or scroll is never mistaken for an outside-click.
 * 3. Photo title & counter are placed directly below the image with compact responsive typography on smaller screens.
 * 4. Responsive breakpoints: iPad vertical (<1024px) matches mobile UX; iPad horizontal & desktop (>=1024px) matches desktop web.
 */
export function ImageLightboxModal({
  isOpen = true,
  onClose,
  title,
  image,
  images,
  initialIndex = 0,
  alt = 'Full view image',
  onIndexChange,
}: ImageLightboxModalProps): JSX.Element | null {
  const validImages: string[] =
    images && images.length > 0 ? images : image ? [image] : []
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Sync currentIndex when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const targetIndex = Math.max(0, Math.min(initialIndex, validImages.length - 1))
      setCurrentIndex(targetIndex)
      requestAnimationFrame(() => {
        const el = scrollRef.current
        if (el) {
          el.scrollLeft = targetIndex * el.clientWidth
        }
      })
    }
  }, [isOpen, initialIndex, validImages.length])

  // Track pointer gestures to prevent closing when dragging/swiping
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
    if (dx > 10 || dy > 10) {
      isDraggingRef.current = true
    }
  }

  // Dismiss modal on backdrop / outside clicks unless user was swiping
  const handleBackdropClick = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      return
    }
    onClose()
  }

  // Real-time horizontal scroll tracking
  const handleScroll = useCallback(() => {
    isDraggingRef.current = true
    const el = scrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width)
      if (newIndex >= 0 && newIndex < validImages.length && newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    }
  }, [validImages.length, currentIndex, onIndexChange])

  // Scroll to a specific photo index
  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current
      if (!el) return
      const targetLeft = index * el.clientWidth
      el.scrollTo({ left: targetLeft, behavior: 'smooth' })
      setCurrentIndex(index)
      onIndexChange?.(index)
    },
    [onIndexChange]
  )

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation()
        if (currentIndex > 0) scrollToIndex(currentIndex - 1)
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation()
        if (currentIndex < validImages.length - 1) scrollToIndex(currentIndex + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, validImages.length, onClose, scrollToIndex])

  if (!isOpen || validImages.length === 0) return null

  const isMultiple = validImages.length > 1

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title || alt || 'Photo Lightbox'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 text-white select-none overscroll-contain cursor-pointer"
      >
        {/* Floating Top-Right Close Button */}
        <div className="absolute top-0 right-0 p-3 sm:p-5 z-40">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label="Close photo lightbox"
            className="p-2 sm:p-2.5 rounded-full text-slate-300 hover:text-white bg-black/60 hover:bg-black/90 border border-white/20 transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Photos Carousel with CSS Scroll Snapping */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="relative w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth cursor-pointer"
        >
          {validImages.map((src, idx) => (
            <div
              key={idx}
              className="w-full h-full shrink-0 snap-center snap-always flex flex-col items-center justify-center p-3 sm:p-6 cursor-pointer"
            >
              {/* Photo & Caption Group: Centers photo and places caption just below it */}
              <div className="flex flex-col items-center max-w-full">
                {/* Photo Image — Clicking the photo itself does NOT close */}
                <img
                  src={src}
                  alt={title ? `${title} — Photo ${idx + 1}` : `${alt} ${idx + 1}`}
                  onClick={(e) => e.stopPropagation()}
                  className="max-w-[96vw] lg:max-w-[92vw] max-h-[66vh] lg:max-h-[74vh] object-contain rounded-lg shadow-2xl pointer-events-auto cursor-default select-none"
                />

                {/* Photo Caption & Counter: Positioned directly below photo */}
                <div className="mt-2.5 flex flex-col items-center justify-center gap-1.5 text-center max-w-2xl px-2">
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2.5">
                    {title && (
                      <h4 className="text-xs sm:text-sm lg:text-base font-medium text-slate-200 line-clamp-1 max-w-[90vw] lg:max-w-xl text-center">
                        {title}
                      </h4>
                    )}
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 text-slate-200 border border-white/10 tracking-wide">
                      Photo {idx + 1} of {validImages.length}
                    </span>
                  </div>

                  {/* Interactive Indicator Dots */}
                  {isMultiple && (
                    <div className="flex items-center justify-center gap-1.5 pt-0.5">
                      {validImages.map((_, dotIdx) => (
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

        {/* Desktop / iPad Navigation Arrows */}
        {isMultiple && currentIndex > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              scrollToIndex(currentIndex - 1)
            }}
            aria-label="Previous photo"
            className="hidden sm:flex absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
        {isMultiple && currentIndex < validImages.length - 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              scrollToIndex(currentIndex + 1)
            }}
            aria-label="Next photo"
            className="hidden sm:flex absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white border border-white/20 shadow-lg transition-all active:scale-90 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
