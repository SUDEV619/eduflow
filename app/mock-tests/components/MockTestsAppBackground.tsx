'use client'

import { motion } from 'framer-motion'

export default function MockTestsAppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-28 -right-20 h-80 w-80 rounded-full blur-3xl opacity-30 bg-secondary"
        animate={{ y: [0, 18, 0], x: [0, -12, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute top-32 -left-24 h-72 w-72 rounded-full blur-3xl opacity-25 bg-accent"
        animate={{ y: [0, -14, 0], x: [0, 10, 0], scale: [1.02, 1.1, 1.02] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute bottom-24 left-1/3 h-64 w-64 rounded-full blur-3xl opacity-20 bg-button"
        animate={{ y: [0, -22, 0], x: [0, 14, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-background/70" />
    </div>
  )
}

