'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useModalHistory } from '@/lib/hooks/useModalHistory'

interface ImageLightboxModalProps {
  image: string
  title?: string
  alt?: string
  onClose: () => void
}

/**
 * ImageLightboxModal — Full-screen uncropped photo viewer.
 *
 * Displays the full photo against a crisp dark backdrop.
 * Uses a single unified root motion transition (150ms easeOut) so the close button,
 * backdrop, and photo all disappear synchronously without lingering cross buttons
 * or GPU compositor blur.
 */
export function ImageLightboxModal({
  image,
  title,
  alt = 'Full view image',
  onClose,
}: ImageLightboxModalProps) {
  const { handleClose } = useModalHistory({
    isOpen: true,
    onClose,
    modalId: 'photo-lightbox',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
    >
      {/* Dark backdrop: clean solid dark overlay without heavy GPU backdrop-filter blur */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/92 cursor-zoom-out"
        aria-hidden="true"
      />

      {/* Top action bar: Close button — fades out synchronously with root */}
      <div className="absolute top-4 right-4 z-[70] flex items-center gap-2">
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close full photo view"
          className="p-2 sm:p-2.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white border border-white/25 shadow-lg transition-all duration-150 cursor-pointer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Main photo container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={handleClose}
        className="relative z-[65] max-w-[96vw] max-h-[92vh] flex flex-col items-center justify-center p-2 sm:p-4 cursor-zoom-out"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-full max-h-[84vh] sm:max-h-[86vh] flex items-center justify-center cursor-default"
        >
          <img
            src={image}
            alt={alt || title || 'Full photo'}
            className="max-w-[94vw] max-h-[82vh] sm:max-h-[85vh] w-auto h-auto object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 select-none"
          />
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
