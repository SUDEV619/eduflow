'use client'

import { motion } from 'framer-motion'
import { Trophy, Flame, Target, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { DashboardData } from '../lib/types'

interface ProgressShowcaseProps {
  data: DashboardData | null;
}

export default function ProgressShowcase({ data }: ProgressShowcaseProps) {
  const [randomQuote, setRandomQuote] = useState('Keep moving forward')

  const motivationalQuotes = [
    "Small progress is still progress.",
    "Consistency beats perfection.",
    "Every expert was once a beginner.",
    "Success is the sum of small efforts.",
    "Focus on progress, not perfection."
  ]

  useEffect(() => {
    setRandomQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])
  }, [])

  const achievements = [
    {
      id: 1,
      title: 'Study Streak',
      description: `${data?.overview.streak || 0} days in a row`,
      icon: Flame,
      color: 'from-orange-400 to-red-500',
      progress: Math.min(100, ((data?.overview.streak || 0) / 7) * 100),
      isCompleted: (data?.overview.streak || 0) >= 7
    },
    {
      id: 2,
      title: 'Focus Goal',
      description: 'Weekly focus target',
      icon: Target,
      color: 'from-accent to-button',
      progress: data?.overview.focus_score || 0,
      isCompleted: (data?.overview.focus_score || 0) >= 100
    },
    {
      id: 3,
      title: 'Total Dedication',
      description: `${data?.overview.total_hours || 0} hours total`,
      icon: Trophy,
      color: 'from-yellow-400 to-orange-500',
      progress: Math.min(100, ((data?.overview.total_hours || 0) / 100) * 100),
      isCompleted: (data?.overview.total_hours || 0) >= 100
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-2xl font-black text-[#4A465F] tracking-tight mb-1">Achievements</h3>
          <p className="text-[#4A465F]/40 text-xs font-black uppercase tracking-widest">Your learning milestones</p>
        </div>

        {/* Achievements List */}
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="flex items-center space-x-5 p-5 bg-white/50 rounded-3xl hover:bg-white/90 transition-all duration-500 border border-transparent hover:border-[#6FB7B4]/10 shadow-sm hover:shadow-xl">
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center shadow-lg relative group-hover:scale-110 transition-transform duration-500`}>
                  <achievement.icon className="w-7 h-7 text-white" />
                  {achievement.isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                    >
                      <span className="text-white text-[10px] font-black">✓</span>
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-[#4A465F] text-lg tracking-tight">{achievement.title}</h4>
                      <p className="text-sm font-bold text-[#4A465F]/40 leading-tight">{achievement.description}</p>
                    </div>
                    <div className="text-xs font-black text-[#6FB7B4]">{Math.round(achievement.progress)}%</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-[#4A465F]/5 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`bg-gradient-to-r ${achievement.color} h-full rounded-full relative`}
                      initial={{ width: 0 }}
                      animate={{ width: `${achievement.progress}%` }}
                      transition={{ duration: 1.5, delay: 0.3 + index * 0.1 }}
                    >
                       <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-md translate-x-12 group-hover:translate-x-[-100px] transition-transform duration-1000" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center bg-[#F5F5F5]/80 backdrop-blur-md rounded-[2rem] p-6 border border-[#4A465F]/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-[#6FB7B4]/5 blur-xl group-hover:bg-[#6FB7B4]/20 transition-all rounded-full" />
          <div className="text-3xl mb-3">⚡</div>
          <blockquote className="text-base text-[#4A465F] font-black italic leading-relaxed uppercase tracking-tight">
            "{randomQuote}"
          </blockquote>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Unread Alerts', value: data?.overview.unread_notifications || 0, color: 'text-[#6FB7B4]' },
            { label: 'Today (min)', value: data?.overview.today_minutes || 0, color: 'text-[#5EC2B7]' }
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-white rounded-2xl border border-[#4A465F]/5 shadow-sm hover:shadow-lg transition-all">
              <div className={`text-2xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
              <div className="text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}