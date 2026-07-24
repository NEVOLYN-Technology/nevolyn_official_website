/**
 * WelcomeBanner — top animated motivational banner shown on the homepage.
 *
 * Renders a subtle floating gradient slogan at the top of the content area.
 *
 * @module components/ui/WelcomeBanner
 */
'use client'

import type { JSX } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated welcome banner element with infinite floating vertical motion.
 *
 * @returns Rendered welcome banner element
 */
export function WelcomeBanner(): JSX.Element {
  return (
    <div className="w-full flex items-center justify-center pt-8 pb-3 px-4 bg-transparent text-center">
      <motion.div
        animate={{
          y: [0, -8, 0],
          opacity: [0.85, 1, 0.85],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="text-center"
      >
        <p className="text-lg sm:text-xl md:text-2xl font-bold italic tracking-wide bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(249,115,22,0.55)]">
          Welcome to the Horizon of Next-Generation Industrial Automation & Innovation
        </p>
      </motion.div>
    </div>
  )
}
