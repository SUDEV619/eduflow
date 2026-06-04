'use client'

import { motion } from 'framer-motion'
import { THEME } from './theme'

type Cell = { date: Date; hours: number }

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10)
}

function intensity(hours: number) {
  if (hours <= 0) return 0.06
  if (hours < 0.75) return 0.18
  if (hours < 1.5) return 0.32
  if (hours < 2.5) return 0.48
  if (hours < 4) return 0.68
  return 0.9
}

export function ActivityHeatmap({
  weeks = 14,
  seed = 7,
}: {
  weeks?: number
  seed?: number
}) {
  const today = startOfDay(new Date())
  const totalDays = weeks * 7
  const start = addDays(today, -(totalDays - 1))

  // Deterministic pseudo-random (stable look in UI demos)
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }

  const cells: Cell[] = Array.from({ length: totalDays }, (_, i) => {
    const date = addDays(start, i)
    const weekday = date.getDay() // 0 Sun..6 Sat
    const base = weekday === 0 ? 0.4 : weekday === 6 ? 0.8 : 1.2
    const trend = i / totalDays
    const hours = Math.max(0, Math.round((base + trend * 2.2 + (rand() - 0.45) * 2.2) * 10) / 10)
    return { date, hours }
  })

  const columns: Cell[][] = Array.from({ length: weeks }, (_, w) => cells.slice(w * 7, w * 7 + 7))
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold" style={{ color: THEME.primaryDark }}>
              Daily consistency
            </div>
            <div className="text-xs text-text/70">Last {weeks} weeks • hover for details</div>
          </div>
          <div className="flex items-center gap-2 text-xs text-text/70">
            <span>Less</span>
            {[0.06, 0.18, 0.32, 0.48, 0.68, 0.9].map((a, i) => (
              <div key={i} className="h-3 w-3 rounded-sm" style={{ backgroundColor: `rgba(111, 183, 180, ${a})` }} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col justify-between py-[2px]">
            {weekdays.map((d) => (
              <div key={d} className="h-4 text-[11px] font-medium" style={{ color: THEME.primaryDark }}>
                {d}
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            {columns.map((col, cIdx) => (
              <div key={cIdx} className="flex flex-col gap-1.5">
                {col.map((cell, rIdx) => (
                  <motion.div
                    key={toISO(cell.date)}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: cIdx * 0.01 + rIdx * 0.008 }}
                    className="h-4 w-4 rounded-sm ring-1 ring-black/5 hover:ring-2 hover:ring-offset-1"
                    style={{
                      backgroundColor: `rgba(111, 183, 180, ${intensity(cell.hours)})`,
                    }}
                    title={`${cell.hours}h • ${cell.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

