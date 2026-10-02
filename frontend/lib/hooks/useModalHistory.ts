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
 * Provides instant 0ms visual dismissal on on-screen button taps while cleanly
 * synchronizing with the browser history stack.
 *
 * 1. Pushes a dummy state into history so the modal becomes the latest history entry.
 * 2. If the user presses the phone's back button / edge swipe, `popstate` fires and
 *    smoothly closes the modal without navigating away.
 * 3. If the user clicks any on-screen "Back" or "Close" button, `handleClose()` will
 *    immediately trigger React closure for zero-lag UI response, and then roll back
 *    history in the background.
 * 4. Manages body scroll locking and keyboard Escape handling.
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

    // 1. Immediately trigger React state closure so exit animation starts at 0ms!
    onCloseRef.current()

    // 2. Cleanly revert history entry in background if one was pushed
    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
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

    // Push history entry for mobile back-button handling (empty string URL keeps current route)
    try {
      const currentState = window.history.state || {}
      window.history.pushState({ ...currentState, [modalId]: true }, '')
      hasPushedStateRef.current = true
    } catch {
      hasPushedStateRef.current = false
    }

    const handlePopState = () => {
      // User tapped phone back button or swiped back
      if (isClosingRef.current) return
      isClosingRef.current = true
      hasPushedStateRef.current = false
      onCloseRef.current()
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
