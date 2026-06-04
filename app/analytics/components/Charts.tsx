'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { THEME } from './theme'

function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

export function SoftTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/60 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md">
      <div className="text-sm font-semibold" style={{ color: THEME.primaryDark }}>
        {label}
      </div>
      <div className="mt-1 space-y-0.5">
        {payload.map((p: any, i: number) => (
          <div key={i} className="text-xs font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}h
          </div>
        ))}
      </div>
    </div>
  )
}

export function StudyTrendsChart({
  data,
}: {
  data: Array<{ label: string; hours: number }>
}) {
  const mounted = useMounted()
  if (!mounted) return <div className="h-72 w-full rounded-2xl bg-black/5" />

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={THEME.primaryAccent} stopOpacity={0.28} />
              <stop offset="80%" stopColor={THEME.primaryAccent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 8" stroke="#E5E7EB" />
          <XAxis dataKey="label" stroke={THEME.primaryDark} fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke={THEME.primaryDark} fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<SoftTooltip />} />
          <Area
            type="monotone"
            dataKey="hours"
            name="Study"
            stroke={THEME.primaryAccent}
            strokeWidth={3}
            fill="url(#hoursFill)"
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
            dot={{ r: 5, fill: THEME.primaryAccent, stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 7, fill: THEME.button, stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SubjectDonut({
  data,
  centerLabel,
}: {
  data: Array<{ name: string; value: number; color: string }>
  centerLabel: { top: string; bottom: string }
}) {
  const mounted = useMounted()
  if (!mounted) return <div className="h-52 w-full rounded-2xl bg-black/5" />

  return (
    <div className="relative h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={86}
            paddingAngle={4}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload?.length) return null
              const p = payload[0]
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="rounded-xl border border-white/60 bg-white/85 px-4 py-3 shadow-xl backdrop-blur-md"
                >
                  <div className="text-sm font-semibold" style={{ color: THEME.primaryDark }}>
                    {p.name}
                  </div>
                  <div className="text-xs font-medium" style={{ color: THEME.text }}>
                    {p.value}% of time
                  </div>
                </motion.div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: THEME.primaryDark }}>
            {centerLabel.top}
          </div>
          <div className="text-xs font-medium" style={{ color: THEME.text }}>
            {centerLabel.bottom}
          </div>
        </div>
      </div>
    </div>
  )
}

