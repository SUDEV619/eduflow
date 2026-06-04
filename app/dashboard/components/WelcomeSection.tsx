'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { DashboardData } from '../lib/types'
import { useAuth } from '@/app/context/AuthContext'

interface WelcomeSectionProps {
  data: DashboardData | null;
}

export default function WelcomeSection({ data }: WelcomeSectionProps) {
  const [greeting, setGreeting] = useState('Welcome')
  const [quote, setQuote] = useState('Stay inspired today')
  const { user } = useAuth()

  const motivationalQuotes = [
    "Stay consistent today",
    "Small progress is still progress",
    "Focus on your goals",
    "Every study session counts",
    "You're building your future"
  ]

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')

    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
  }, [])

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hrs === 0) return `${mins}m`
    return `${hrs}h ${mins}m`
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      <div className="bg-gradient-to-r from-white/80 to-secondary/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg relative">
        {/* Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 blob-shape opacity-10 -z-10" />
        
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl lg:text-4xl font-black text-[#4A465F] tracking-tight"
            >
              {greeting}, {user?.name?.split(' ')[0] || 'User'}! 👋
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg font-black text-[#4A465F]/60"
            >
              {quote}
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center flex-wrap gap-6 pt-4"
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#6FB7B4] rounded-full animate-pulse" />
                <span className="text-sm font-black text-[#4A465F]/40 uppercase tracking-widest">
                    {formatMinutes(data?.overview.today_minutes || 0)} studied today
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#5EC2B7] rounded-full" />
                <span className="text-sm font-black text-[#4A465F]/40 uppercase tracking-widest">
                    {data?.overview.streak || 0}-day streak 🔥
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#4A465F]/20 rounded-full" />
                <span className="text-sm font-black text-[#4A465F]/40 uppercase tracking-widest">
                    {data?.overview.focus_score || 0}% Focus Score 🎯
                </span>
              </div>
            </motion.div>
          </div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:block relative"
          >
            <div className="w-40 h-40 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#6FB7B4]/5 blur-3xl rounded-full" />
              <motion.div
                animate={{ 
                  y: [0, -20, 0],
                  rotate: [0, 10, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-[#6FB7B4] to-[#5EC2B7] rounded-[2.5rem] shadow-2xl flex items-center justify-center text-5xl">
                  📚
                </div>
              </motion.div>

              {[
                { icon: "🎓", delay: 0, orbit: 1.2 },
                { icon: "✨", delay: 1, orbit: 1.4 },
                { icon: "🚀", delay: 2, orbit: 1.1 }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 15 + i * 5, repeat: Infinity, ease: "linear" },
                    scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: item.delay }
                  }}
                  className="absolute"
                  style={{ width: '100%' }}
                >
                  <div className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center text-xl border border-[#4A465F]/5 translate-x-20">
                    {item.icon}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}