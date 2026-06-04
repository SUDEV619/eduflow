'use client'

import { motion } from 'framer-motion'
import { THEME } from './theme'

export function ProgressBar({
  label,
  value,
  meta,
}: {
  label: string
  value: number // 0..100
  meta?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium" style={{ color: THEME.primaryDark }}>
          {label}
        </div>
        {meta ? (
          <div className="text-xs font-medium text-text/70">{meta}</div>
        ) : (
          <div className="text-xs font-medium text-text/70">{value}%</div>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-black/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="h-2 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${THEME.primaryAccent}, ${THEME.button})`,
          }}
        />
      </div>
    </div>
  )
}

export function CircularProgress({
  value,
  size = 112,
  strokeWidth = 10,
  label,
}: {
  value: number // 0..100
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, value))
  const offset = c - (clamped / 100) * c

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.08)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          stroke={THEME.primaryAccent}
          initial={{ strokeDasharray: c, strokeDashoffset: c }}
          animate={{ strokeDasharray: c, strokeDashoffset: offset }}
          transition={{ duration: 1.25, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-2xl font-bold"
          style={{ color: THEME.primaryDark }}
        >
          {clamped}%
        </motion.div>
        {label ? <div className="mt-0.5 text-[11px] font-medium text-text/70">{label}</div> : null}
      </div>
    </div>
  )
}

