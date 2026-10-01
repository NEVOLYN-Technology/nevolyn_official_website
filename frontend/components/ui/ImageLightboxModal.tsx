'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageLightboxModalProps {
  image: string
  images?: string[]
  initialIndex?: number
  title?: string
  alt?: string
  onClose: () => void
  onIndexChange?: (index: number) => void
}

/**
 * ImageLightboxModal — High-performance full-screen uncropped photo viewer.
 *
 * Designed for 0ms latency and 60fps on mobile.
 * Completely avoids window.history manipulation which causes Next.js App Router
 * to trigger route revalidation / white screen flashes.
 *
 * UX Requirements:
 * 1. Anywhere outside the photo click dismisses the lightbox.
 * 2. Gesture disambiguation: horizontal swipe or scroll is never mistaken for an outside-click.
 * 3. Photo title & counter are placed directly below the image with compact responsive typography on smaller screens.
 * 4. Responsive breakpoints: iPad vertical (<1024px) matches mobile UX; iPad horizontal & desktop (>=1024px) matches desktop web.
 */
export function ImageLightboxModal({
  image,
  images,
  initialIndex = 0,
  title,
  alt = 'Full view image',
  onClose,
  onIndexChange,
}: ImageLightboxModalProps) {
  const photoList = images && images.length > 0 ? images : [image]
  const [currentIndex, setCurrentIndex] = useState(
    initialIndex >= 0 && initialIndex < photoList.length ? initialIndex : 0
  )
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Drag & pointer tracking to disambiguate swiping/scrolling from true outside-clicks
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)

  // Notify parent component of index changes
  useEffect(() => {
    onIndexChange?.(currentIndex)
  }, [currentIndex, onIndexChange])

  // Scroll to initial index on mount
  useEffect(() => {
    const el = scrollContainerRef.current
    if (el && initialIndex > 0) {
      const width = el.clientWidth
      el.scrollTo({ left: initialIndex * width, behavior: 'auto' })
    }
  }, [initialIndex])

  // Smooth scroll container to a specific index
  const scrollToPhoto = useCallback((index: number) => {
    const el = scrollContainerRef.current
    if (!el) {
      setCurrentIndex(index)
      return
    }
    const width = el.clientWidth
    el.scrollTo({ left: index * width, behavior: 'smooth' })
    setCurrentIndex(index)
  }, [])

  const handlePrev = useCallback(() => {
    const target = currentIndex > 0 ? currentIndex - 1 : photoList.length - 1
    scrollToPhoto(target)
  }, [currentIndex, photoList.length, scrollToPhoto])

  const handleNext = useCallback(() => {
    const target = currentIndex < photoList.length - 1 ? currentIndex + 1 : 0
    scrollToPhoto(target)
  }, [currentIndex, photoList.length, scrollToPhoto])

  // Track horizontal scroll position and update currentIndex
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const width = el.clientWidth
    if (width > 0) {
      const newIndex = Math.round(el.scrollLeft / width)
      if (newIndex >= 0 && newIndex < photoList.length && newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
      }
    }
  }, [currentIndex, photoList.length])

  // Pointer event handlers for swipe detection
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
    isDraggingRef.current = false
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return
    const dx = Math.abs(e.clientX - pointerStartRef.current.x)
    const dy = Math.abs(e.clientY - pointerStartRef.current.y)
    if (dx > 10 || dy > 10) {
      isDraggingRef.current = true
    }
  }

  // Dismiss only if user truly tapped/clicked outside without dragging/swiping
  const handleBackdropClick = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      return
    }
    onClose()
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && photoList.length > 1) {
        handlePrev()
      } else if (e.key === 'ArrowRight' && photoList.length > 1) {
        handleNext()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, photoList.length, handlePrev, handleNext])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden touch-none overscroll-none cursor-zoom-out select-none"
    >
      {/* Dark backdrop: solid dark overlay for 0ms lag */}
      <div
        className="fixed inset-0 bg-black/92 pointer-events-none"
        aria-hidden="true"
      />

      {/* Top action bar: Close button */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-[75] flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          type="button"
          aria-label="Close full photo view"
          className="p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 shadow-lg transition-all duration-150 cursor-pointer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Prev / Next navigation buttons for multiple images */}
      {photoList.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            type="button"
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-[70] p-2.5 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 shadow-xl transition-all duration-150 cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            type="button"
            aria-label="Next image"
            className="absolute right-2 sm:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-[70] p-2.5 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 shadow-xl transition-all duration-150 cursor-pointer active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Main photo container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className="relative z-[65] w-full h-full flex items-center justify-center p-2 sm:p-4 pointer-events-none"
      >
        {/* Horizontal Swipe/Scroll Track for multiple photos with snap */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative w-full h-full flex items-center overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth pointer-events-auto"
        >
          {photoList.map((photoSrc, idx) => (
            <div
              key={idx}
              onClick={handleBackdropClick}
              className="w-full h-full shrink-0 snap-center snap-always flex flex-col items-center justify-center p-2 sm:p-3 lg:p-4 cursor-zoom-out"
            >
              {/* Photo Card: Clicking on the image stops dismissal */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-full flex flex-col items-center justify-center cursor-default"
              >
                <img
                  src={photoSrc}
                  alt={`${alt || title || 'Full photo'} ${idx + 1}`}
                  className="max-w-[94vw] max-h-[72vh] sm:max-h-[76vh] lg:max-h-[82vh] w-auto h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 select-none pointer-events-auto"
                />

                {/* Photo Name & Counter: Positioned directly below the image */}
                {(title || photoList.length > 1) && (
                  <div className="mt-2 sm:mt-2.5 flex items-center justify-center gap-1.5 sm:gap-2 max-w-[92vw] sm:max-w-lg lg:max-w-xl mx-auto pointer-events-auto">
                    {photoList.length > 1 && (
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold shrink-0 shadow-md">
                        {idx + 1} / {photoList.length}
                      </span>
                    )}
                    {title && (
                      <div
                        title={title}
                        className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/15 text-white font-medium shadow-md truncate text-[11px] sm:text-xs lg:text-sm max-w-[70vw] sm:max-w-sm lg:max-w-md text-center"
                      >
                        {title}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
