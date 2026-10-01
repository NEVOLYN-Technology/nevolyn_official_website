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
 * Displays only the full, uncropped photo against a dark translucent backdrop.
 * Integrates `useModalHistory` for smooth mobile back-button/swipe-back closing.
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden">
      {/* Dark backdrop with blur */}
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md cursor-zoom-out"
        aria-hidden="true"
      />

      {/* Top action bar: Close button */}
      <div className="absolute top-4 right-4 z-[70] flex items-center gap-2">
        <button
          onClick={handleClose}
          type="button"
          aria-label="Close full photo view"
          className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white border border-white/20 backdrop-blur-md shadow-lg transition-all duration-200 cursor-pointer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Main photo container */}
      <motion.div
        key="lightbox-content"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
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
            className="mt-3 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-semibold max-w-[90vw] truncate shadow-lg"
          >
            {title}
          </div>
        )}
      </motion.div>
    </div>
  )
}
