'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
}

/**
 * useModalHistory - Manages browser history integration for popup modals.
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

  // Unified close handler for on-screen buttons and backdrop clicks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true

    // Instantly unlock body scroll so page scrolling works immediately
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
    document.body.style.paddingRight = ''

    // 1. Instantly trigger UI close in React state (0ms latency, no async lag on web)
    onClose()

    // 2. Safely pop history state in the background
    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
        window.history.back()
      }
    }
  }, [onClose, modalId])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      hasPushedStateRef.current = false
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.body.style.paddingRight = ''
      return
    }

    isClosingRef.current = false

    // Push history entry for mobile back-button handling
    try {
      const currentState = window.history.state || {}
      window.history.pushState({ ...currentState, [modalId]: true }, '')
      hasPushedStateRef.current = true
    } catch {
      // Fallback if pushState is restricted
      hasPushedStateRef.current = false
    }

    const handlePopState = () => {
      // Instantly restore page scroll
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.body.style.paddingRight = ''

      // If handleClose() already triggered UI close, ignore the subsequent popstate event
      if (isClosingRef.current) {
        hasPushedStateRef.current = false
        return
      }
      isClosingRef.current = true
      hasPushedStateRef.current = false
      onClose()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Lock background scroll while modal is active, compensating scrollbar width to prevent Windows layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      // Directly restore body scroll styles without RAF race conditions
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen, modalId, onClose, handleClose])

  return { handleClose }
}
