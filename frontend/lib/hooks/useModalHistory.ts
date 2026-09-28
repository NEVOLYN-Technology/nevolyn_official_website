'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
}

/**
 * useModalHistory — Manages browser history integration for popup modals.
 *
 * Solves the critical mobile UX issue where tapping the phone's physical Back button,
 * swipe-back gesture, or browser back button navigates away from the website instead
 * of closing the modal.
 *
 * When the modal opens:
 * 1. Pushes a dummy state into history so the modal becomes the latest history entry.
 * 2. If the user presses the phone's back button / edge swipe, `popstate` fires and
 *    smoothly closes the modal without leaving the website.
 * 3. If the user clicks any on-screen "Back" or "Close" button, `handleClose()` will
 *    call `window.history.back()`, cleanly popping the history state and closing the modal.
 * 4. Manages body scroll locking and keyboard Escape handling.
 */
export function useModalHistory({ isOpen, onClose, modalId = 'modal' }: UseModalHistoryOptions) {
  const hasPushedStateRef = useRef(false)
  const isClosingRef = useRef(false)
  const onCloseRef = useRef(onClose)

  // Keep latest onClose callback without re-triggering effects
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Unified instantaneous close handler for on-screen buttons and backdrop clicks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    // 1. Immediately trigger UI close with 0ms delay so modal exits instantly
    onCloseRef.current()

    // 2. Pop pushed history entry after next tick so React paints closed state without thread blocking
    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
          try {
            window.history.back()
          } catch {
            // ignore
          }
        }
      }, 40)
    }
  }, [modalId])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      hasPushedStateRef.current = false
      return
    }

    // Guard against duplicate history pushes during parent re-renders
    if (!hasPushedStateRef.current) {
      isClosingRef.current = false
      try {
        const currentState = window.history.state || {}
        window.history.pushState({ ...currentState, [modalId]: true }, '')
        hasPushedStateRef.current = true
      } catch {
        hasPushedStateRef.current = false
      }
    }

    const handlePopState = () => {
      // User tapped phone physical back button or swiped back
      if (hasPushedStateRef.current) {
        hasPushedStateRef.current = false
        isClosingRef.current = true
        onCloseRef.current()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Lock background scroll while modal is active
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.touchAction = originalTouchAction
    }
  }, [isOpen, modalId, handleClose])

  return { handleClose }
}
