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
 * Supports multi-photo horizontal swipe/scroll with snap, arrow buttons, and keyboard arrows.
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

  // Listen for keyboard navigation
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
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden touch-none overscroll-none"
    >
      {/* Dark backdrop: clean solid dark overlay, tap to dismiss */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/92 cursor-zoom-out"
        aria-hidden="true"
      />

      {/* Top action bar: Close button & Photo index badge */}
      <div className="absolute top-4 right-4 z-[70] flex items-center gap-2">
        {photoList.length > 1 && (
          <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-xs font-bold">
            {currentIndex + 1} of {photoList.length}
          </div>
        )}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close full photo view"
          className="p-2.5 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 shadow-lg transition-all duration-150 cursor-pointer"
        >
          <X className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Prev / Next navigation for multiple images */}
      {photoList.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            type="button"
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 shadow-xl transition-all duration-150 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            type="button"
            aria-label="Next image"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[70] p-3 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 shadow-xl transition-all duration-150 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Main photo container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        onClick={onClose}
        className="relative z-[65] w-full max-w-[96vw] max-h-[92vh] flex flex-col items-center justify-center p-2 sm:p-4 cursor-zoom-out"
      >
        {/* Horizontal Swipe/Scroll Track for multiple photos with snap */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-full max-h-[84vh] sm:max-h-[86vh] w-full flex items-center overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth"
        >
          {photoList.map((photoSrc, idx) => (
            <div
              key={idx}
              className="w-full h-full shrink-0 snap-center snap-always flex items-center justify-center cursor-default p-1 select-none"
            >
              <img
                src={photoSrc}
                alt={`${alt || title || 'Full photo'} ${idx + 1}`}
                className="max-w-[94vw] max-h-[82vh] sm:max-h-[85vh] w-auto h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 select-none pointer-events-auto"
              />
            </div>
          ))}
        </div>

        {/* Bottom Title Pill */}
        {title && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/15 text-white text-xs sm:text-sm font-semibold max-w-[90vw] truncate shadow-lg"
          >
            {title}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
