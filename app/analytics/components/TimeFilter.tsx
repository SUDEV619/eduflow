'use client'

import { motion } from 'framer-motion'
import { THEME } from './theme'
import { cn } from './cn'

export type TimeFilterKey = 'Daily' | 'Weekly' | 'Monthly'

export function TimeFilter({
  value,
  onChange,
  className,
}: {
  value: TimeFilterKey
  onChange: (v: TimeFilterKey) => void
  className?: string
}) {
  const items: TimeFilterKey[] = ['Daily', 'Weekly', 'Monthly']

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {items.map((k) => {
        const active = value === k
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={cn(
              'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active ? 'text-white' : 'text-text/70 hover:text-text'
            )}
            style={active ? { backgroundColor: THEME.button } : { backgroundColor: 'rgba(255,255,255,0.55)' }}
          >
            {active ? (
              <motion.span
                layoutId="analytics-filter-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${THEME.button}, ${THEME.primaryAccent})`,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            ) : null}
            <span className="relative">{k}</span>
          </button>
        )
      })}
    </div>
  )
}

