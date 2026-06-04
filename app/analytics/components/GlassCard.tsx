'use client'

import { motion } from 'framer-motion'
import { cn } from './cn'

export function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { y: -4 } : undefined}
      className={cn(
        'relative rounded-2xl border border-white/40 bg-white/30 backdrop-blur-md shadow-[0_8px_32px_rgba(74,70,95,0.08)]',
        hover ? 'transition-shadow duration-300 hover:shadow-[0_14px_44px_rgba(74,70,95,0.14)]' : '',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 to-white/10 opacity-70" />
      <div className="relative">{children}</div>
    </motion.div>
  )
}

