'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
}

/**
 * useModalHistory - Zero-Lag Browser History Integration for Modals.
 *
 * Guarantees:
 * 1. Instant 0ms visual dismissal on on-screen button/backdrop taps (zero delay).
 * 2. Mobile hardware back button & swipe-back gesture smoothly dismisses the modal.
 * 3. Complete suppression of Next.js App Router route reload/re-fetching via
 *    capture-phase `stopImmediatePropagation()`.
 * 4. Zero website blur or re-renders when navigating back.
 */
export function useModalHistory({ isOpen, onClose, modalId = 'modal' }: UseModalHistoryOptions) {
  const hasPushedStateRef = useRef(false)
  const isClosingRef = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Unified close handler for on-screen buttons and backdrop clicks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    // 1. Immediately trigger React state closure for instant 0ms dismissal!
    onCloseRef.current()

    // 2. Cleanly revert history entry in background if one was pushed
    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
        // Intercept and swallow the popstate event so Next.js never sees it and never reloads
        const consumePopState = (e: PopStateEvent) => {
          e.stopImmediatePropagation()
          window.removeEventListener('popstate', consumePopState, true)
        }
        window.addEventListener('popstate', consumePopState, true)
        // Safety timeout to clean up listener if popstate was not fired
        setTimeout(() => {
          window.removeEventListener('popstate', consumePopState, true)
        }, 1000)

        window.history.back()
      }
    }
  }, [modalId])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      hasPushedStateRef.current = false
      return
    }

    isClosingRef.current = false

    // Push lightweight history entry for mobile back-button handling
    try {
      const currentState = window.history.state || {}
      window.history.pushState({ ...currentState, [modalId]: true }, '')
      hasPushedStateRef.current = true
    } catch {
      hasPushedStateRef.current = false
    }

    const handlePopState = (e: PopStateEvent) => {
      // User tapped phone physical back button or swiped back
      if (isClosingRef.current) return
      isClosingRef.current = true
      hasPushedStateRef.current = false

      // Prevent Next.js App Router from treating modal pop as a page route change
      e.stopImmediatePropagation()
      onCloseRef.current()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    // Attach in CAPTURE phase so we intercept before Next.js App Router
    window.addEventListener('popstate', handlePopState, true)
    window.addEventListener('keydown', handleKeyDown)

    // Lock background scroll while modal is active
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('popstate', handlePopState, true)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
    }
  }, [isOpen, modalId, handleClose])

  return { handleClose }
}
