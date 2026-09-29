'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseModalHistoryOptions {
  isOpen: boolean
  onClose: () => void
  modalId?: string
  animationDuration?: number
}

// Module-level tracking for popstate interception so Next.js App Router never sees modal pops
let pendingHistoryPops = 0
let activeModalCloser: (() => void) | null = null
let isGlobalPopListenerAttached = false

function initGlobalPopListener() {
  if (typeof window === 'undefined' || isGlobalPopListenerAttached) return
  isGlobalPopListenerAttached = true

  // Capture phase listener: runs BEFORE Next.js's router popstate listener!
  window.addEventListener(
    'popstate',
    (e: PopStateEvent) => {
      // 1. If we triggered window.history.back() during on-screen modal close:
      if (pendingHistoryPops > 0) {
        pendingHistoryPops--
        e.stopImmediatePropagation()
        return
      }

      // 2. If the user pressed phone's physical back button or gesture while modal was open:
      if (activeModalCloser) {
        e.stopImmediatePropagation()
        const closer = activeModalCloser
        activeModalCloser = null
        closer()
      }
    },
    { capture: true }
  )
}

/**
 * useModalHistory - Manages hardware back button, smooth exit transition, and scroll locking.
 *
 * Eliminates stutter/freeze on modal exit ("laggy for a small time") by:
 * 1. Pre-exit transition state (`isClosing`): triggers GPU-accelerated CSS exit animations
 *    for 180ms before unmounting.
 * 2. Non-blocking focus & scroll restoration: deferred to `requestAnimationFrame` during cleanup
 *    to prevent synchronous forced layout recalculations.
 * 3. Next.js router isolation: captures popstate in the capture phase and prevents propagation,
 *    stopping Next.js App Router from running slow route reconciliation transitions on mobile.
 */
export function useModalHistory({
  isOpen,
  onClose,
  modalId = 'modal',
  animationDuration = 180,
}: UseModalHistoryOptions) {
  const [isClosing, setIsClosing] = useState(false)
  const isClosingRef = useRef(false)
  const hasPushedStateRef = useRef(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // Ensure global capture listener is attached once on the client
  useEffect(() => {
    initGlobalPopListener()
  }, [])

  // Unified exit sequence for both on-screen buttons and mobile physical back button
  const startCloseSequence = useCallback(() => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setIsClosing(true)

    // Clear active modal closer
    if (activeModalCloser === startCloseSequence) {
      activeModalCloser = null
    }

    // Clean up pushed history entry without triggering Next.js navigation
    if (hasPushedStateRef.current) {
      hasPushedStateRef.current = false
      pendingHistoryPops++
      try {
        window.history.back()
      } catch {
        pendingHistoryPops = Math.max(0, pendingHistoryPops - 1)
      }
    }

    // Allow the 180ms GPU-accelerated exit animation to complete before unmounting
    closeTimeoutRef.current = setTimeout(() => {
      // Non-blocking focus & layout restoration: defer to RAF
      requestAnimationFrame(() => {
        onCloseRef.current()
      })
    }, animationDuration)
  }, [animationDuration])

  // On-screen buttons, Escape key, or backdrop click
  const handleClose = useCallback(() => {
    startCloseSequence()
  }, [startCloseSequence])

  useEffect(() => {
    if (!isOpen) {
      isClosingRef.current = false
      setIsClosing(false)
      hasPushedStateRef.current = false
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      return
    }

    isClosingRef.current = false
    setIsClosing(false)
    activeModalCloser = startCloseSequence

    // Push dummy history entry for mobile hardware back-button handling
    try {
      const currentState = window.history.state || {}
      window.history.pushState(
        { ...currentState, [modalId]: true, __modal: true },
        '',
        window.location.href
      )
      hasPushedStateRef.current = true
    } catch {
      hasPushedStateRef.current = false
    }

    // Keyboard Escape handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    // Non-blocking body scroll locking
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.dataset.modalOpen = 'true'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (activeModalCloser === startCloseSequence) {
        activeModalCloser = null
      }
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }

      // Non-blocking scroll restoration via RAF
      requestAnimationFrame(() => {
        document.body.style.overflow = originalOverflow
        delete document.body.dataset.modalOpen
      })
    }
  }, [isOpen, modalId, handleClose, startCloseSequence])

  return { handleClose, isClosing }
}
