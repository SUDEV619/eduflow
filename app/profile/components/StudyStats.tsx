'use client'

import { motion } from 'framer-motion'
import { Hourglass, Flame, TrendingUp, Calendar, Zap } from 'lucide-react'
import { ProfileStats } from '../lib/types'
import { useEffect, useState } from 'react'

interface StudyStatsProps {
  stats: ProfileStats;
}

function CountUp({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = value
    const totalSteps = 60
    const stepDuration = (duration * 1000) / totalSteps
    
    if (end === 0) {
        setCount(0)
        return
    }

    const timer = setInterval(() => {
      start += end / totalSteps
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Number(start.toFixed(1)))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{count}</span>
}

export default function StudyStats({ stats }: StudyStatsProps) {
  const cards = [
    { label: 'Total Hours', value: stats.total_hours, icon: Hourglass, color: 'text-indigo-500', bg: 'bg-indigo-500/10', suffix: 'h' },
    { label: 'Daily Average', value: stats.daily_average, icon: TrendingUp, color: 'text-[#6FB7B4]', bg: 'bg-[#6FB7B4]/10', suffix: 'h' },
    { label: 'Today Time', value: stats.today_hours, icon: Zap, color: 'text-rose-500', bg: 'bg-rose-500/10', suffix: 'h' },
    { label: 'Current Streak', value: stats.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', suffix: ' days' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
          }}
          className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#4A465F]/5 group"
        >
          <div className="flex flex-col h-full gap-8">
            <div className={`w-16 h-16 rounded-2xl ${card.bg} flex items-center justify-center ${card.color} shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out p-4 group-hover:ring-8 group-hover:ring-white`}>
              <card.icon className="w-full h-full" />
            </div>
            
            <div className="space-y-1">
              <div className="text-4xl font-black text-[#4A465F] tracking-tight group-hover:text-[#6FB7B4] transition-colors">
                <CountUp value={card.value} />{card.suffix}
              </div>
              <p className="text-sm font-black text-[#4A465F]/40 uppercase tracking-widest pl-1">
                {card.label}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
