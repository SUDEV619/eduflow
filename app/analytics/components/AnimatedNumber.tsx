'use client'

import { useEffect, useState } from 'react'

export function AnimatedNumber({
  value,
  durationMs = 1400,
  format,
}: {
  value: number
  durationMs?: number
  format?: (n: number) => string
}) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    let raf = 0

    const tick = (t: number) => {
      if (!start) start = t
      const p = Math.min((t - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayValue(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, durationMs])

  return <span>{format ? format(displayValue) : displayValue}</span>
}

