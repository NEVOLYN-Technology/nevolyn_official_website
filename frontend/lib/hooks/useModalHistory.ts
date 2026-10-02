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
 * Smooth modal history pattern:
 * 1. Pushes a dummy state into history so the modal becomes the latest history entry.
 * 2. If the user presses the phone's back button / swipe-back gesture, `popstate` fires and
 *    smoothly closes the modal without leaving the website or reloading.
 * 3. If the user clicks any on-screen "Back" or "Close" button, `handleClose()` will
 *    immediately dismiss the modal (0ms UI response) and revert history in the background.
 * 4. Intercepts `popstate` in capture phase with `stopImmediatePropagation()` so Next.js App Router
 *    never treats the modal history pop as a page route change, preventing any background blur or reload.
 * 5. Manages body scroll locking and keyboard Escape handling.
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

    // Immediately trigger React state closure for instant 0ms dismissal
    onCloseRef.current()

    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
        window.history.back()
        return
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

    // Push history entry for mobile back-button handling
    try {
      const currentState = window.history.state || {}
      window.history.pushState({ ...currentState, [modalId]: true }, '')
      hasPushedStateRef.current = true
    } catch {
      hasPushedStateRef.current = false
    }

    const handlePopState = (e: PopStateEvent) => {
      // User tapped phone back button or swiped back
      hasPushedStateRef.current = false
      // Prevent Next.js App Router from treating modal pop as a route transition (no reload/blur)
      e.stopImmediatePropagation()
      onCloseRef.current()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

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

