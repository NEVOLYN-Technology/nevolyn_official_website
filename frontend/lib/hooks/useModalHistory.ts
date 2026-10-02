'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
}

interface ModalEntry {
  modalId: string
  onClose: () => void
}

declare global {
  interface Window {
    __MODAL_HISTORY_INITIALIZED__?: boolean
  }
}

// Global counter tracking programmatic window.history.back() calls triggered by on-screen buttons
let programmaticBackCount = 0

// Global LIFO stack of active modals
const activeModalStack: ModalEntry[] = []

/**
 * Global capture-phase popstate interceptor.
 * Intercepts popstate events BEFORE Next.js App Router receives them.
 * This completely eliminates:
 * 1. Next.js router revalidation / window.location.reload()
 * 2. Unnecessary page remounts and loading screen flashes
 * 3. Mobile alpha-composite white screen flicker
 */
if (typeof window !== 'undefined' && !window.__MODAL_HISTORY_INITIALIZED__) {
  window.__MODAL_HISTORY_INITIALIZED__ = true

  window.addEventListener(
    'popstate',
    (e: PopStateEvent) => {
      // 1. Programmatic close (triggered by on-screen X / Backdrop / Back button)
      if (programmaticBackCount > 0) {
        programmaticBackCount--
        e.stopImmediatePropagation()
        return
      }

      // 2. Hardware back button / mobile swipe-back gesture
      if (activeModalStack.length > 0) {
        const topModal = activeModalStack[activeModalStack.length - 1]
        // If the top modal's modalId is no longer present in history state, it was popped
        if (!e.state || !e.state[topModal.modalId]) {
          e.stopImmediatePropagation()
          activeModalStack.pop()
          topModal.onClose()
        }
      }
    },
    true // Capture phase: runs before Next.js App Router's popstate listener!
  )
}

/**
 * useModalHistory - Zero-Lag Hierarchical Browser History Integration for Modals.
 *
 * Implements strict LIFO (Last-In-First-Out) nested modal history stack:
 * 1. Pushes lightweight history state with `[modalId]: true`.
 * 2. On hardware Back button or swipe gesture, dismisses the top modal and
 *    stops propagation in capture phase so Next.js never re-renders the route.
 * 3. On on-screen Close/Back click, dismisses at 0ms and rolls back history
 *    cleanly with programmatic suppression.
 * 4. Preserves body scroll lock until all active modals are closed.
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

    // Remove from activeModalStack immediately
    const idx = activeModalStack.findIndex((entry) => entry.modalId === modalId)
    if (idx !== -1) {
      activeModalStack.splice(idx, 1)
    }

    // Immediately trigger React state closure for instant 0ms dismissal
    onCloseRef.current()

    // Revert history entry in background with programmatic suppression
    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
        programmaticBackCount++
        window.history.back()
        setTimeout(() => {
          if (programmaticBackCount > 0) {
            programmaticBackCount--
          }
        }, 1000)
      }
    }
  }, [modalId])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      return
    }

    isClosingRef.current = false

    // Register this modal in activeModalStack
    const entry: ModalEntry = {
      modalId,
      onClose: () => {
        isClosingRef.current = true
        hasPushedStateRef.current = false
        onCloseRef.current()
      },
    }
    activeModalStack.push(entry)

    // Push lightweight history entry for mobile back-button handling
    try {
      const currentState = typeof window !== 'undefined' && window.history.state ? window.history.state : {}
      window.history.pushState({ ...currentState, [modalId]: true }, '')
      hasPushedStateRef.current = true
    } catch {
      hasPushedStateRef.current = false
    }

    // Lock background scroll while modal is active
    const originalOverflow = document.body.style.overflow
    const originalTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)

      // Remove from activeModalStack if still present
      const index = activeModalStack.findIndex((item) => item.modalId === modalId)
      if (index !== -1) {
        activeModalStack.splice(index, 1)
      }

      // Revert history entry if unmounted while still having an active state
      if (hasPushedStateRef.current && !isClosingRef.current) {
        hasPushedStateRef.current = false
        if (typeof window !== 'undefined' && window.history.state && window.history.state[modalId]) {
          programmaticBackCount++
          window.history.back()
          setTimeout(() => {
            if (programmaticBackCount > 0) {
              programmaticBackCount--
            }
          }, 1000)
        }
      }

      // Only restore scroll if no other dialogs are still active
      if (activeModalStack.length === 0) {
        document.body.style.overflow = originalOverflow
        document.body.style.touchAction = originalTouchAction
      }
    }
  }, [isOpen, modalId, handleClose])

  return { handleClose }
}
