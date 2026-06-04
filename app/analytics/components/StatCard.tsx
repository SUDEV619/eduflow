'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { AnimatedNumber } from './AnimatedNumber'
import { GlassCard } from './GlassCard'
import { THEME } from './theme'

export function StatCard({
  icon: Icon,
  title,
  value,
  unit,
  trend,
  delay = 0,
}: {
  icon: React.ElementType
  title: string
  value: number
  unit: string
  trend?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay }}
    >
      <GlassCard className="p-5" hover>
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-sm font-medium" style={{ color: THEME.primaryDark }}>
              {title}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-3xl font-bold tracking-tight" style={{ color: THEME.text }}>
                <AnimatedNumber value={value} />
              </div>
              <div className="text-sm font-medium" style={{ color: THEME.primaryDark }}>
                {unit}
              </div>
            </div>
            {trend ? (
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: THEME.primaryAccent }}>
                <ArrowUpRight size={14} />
                <span className="truncate">{trend}</span>
              </div>
            ) : null}
          </div>

          <div className="rounded-xl p-3" style={{ backgroundColor: `${THEME.primaryAccent}20` }}>
            <Icon size={22} style={{ color: THEME.primaryAccent }} />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

