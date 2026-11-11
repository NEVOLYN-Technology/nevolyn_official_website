'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
  hash?: string
}

/**
 * useModalHistory - Manages browser history integration for popup modals.
 *
 * Handles deep-link hash synchronization, history stack pre-population for shared links,
 * backdrop clicks, Escape key, and body scroll lock.
 */
export function useModalHistory({ isOpen, onClose, modalId = 'modal', hash }: UseModalHistoryOptions) {
  const hasPushedStateRef = useRef(false)
  const isClosingRef = useRef(false)

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
        window.history.back()
        return
      }
    }

    if (typeof window !== 'undefined' && hash && window.location.hash.includes('/')) {
      const parentHash = window.location.hash.split('/')[0] || '#team'
      window.history.replaceState(null, '', `${window.location.pathname}${parentHash}`)
    }

    onClose()
  }, [onClose, modalId, hash])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      hasPushedStateRef.current = false
      return
    }

    isClosingRef.current = false

    try {
      const currentState = window.history.state || {}
      const targetUrl = hash ? `${window.location.pathname}${hash.startsWith('#') ? hash : `#${hash}`}` : ''
      const isDirectDeepLink = Boolean(hash && window.location.hash === (hash.startsWith('#') ? hash : `#${hash}`))

      if (isDirectDeepLink) {
        // Direct arrival from shared link: pre-populate base section in history first,
        // then push the modal state so hitting Back/Close stays on the site's team section.
        const parentHash = hash?.split('/')[0] || '#team'
        window.history.replaceState({ ...currentState, isBase: true }, '', `${window.location.pathname}${parentHash}`)
        window.history.pushState({ ...currentState, [modalId]: true }, '', targetUrl)
        hasPushedStateRef.current = true
      } else {
        window.history.pushState({ ...currentState, [modalId]: true }, '', targetUrl)
        hasPushedStateRef.current = true
      }
    } catch {
      hasPushedStateRef.current = false
    }

    const handlePopState = () => {
      hasPushedStateRef.current = false
      onClose()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Body scroll lock
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
    }
  }, [isOpen, modalId, hash, onClose, handleClose])

  return { handleClose }
}
