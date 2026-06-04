
'use client'

import { motion } from 'framer-motion'
import { BarChart3, PieChart, TrendingUp, Target, Clock, Award } from 'lucide-react'

interface ProductivityInsightsProps {
  stats: {
    daily: { daily_minutes: number, daily_hours: number }
    weekly: any[]
    subjects: any[]
    quick: { total_hours: number, total_sessions: number, avg_minutes_per_day: number }
  }
}

export default function ProductivityInsights({ stats }: ProductivityInsightsProps) {
  const getSubjectColor = (index: number) => {
    const colors = ['#6FB7B4', '#5EC2B7', '#A8DAD6', '#4A465F']
    return colors[index % colors.length]
  }

  const maxWeekly = Math.max(...stats.weekly.map(d => d.total), 1)

  return (
    <div className="space-y-6">
      {/* Today's Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#4A465F]/5"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#5EC2B7]/10 rounded-2xl flex items-center justify-center text-[#5EC2B7]">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#4A465F]">Today's Focus</h3>
            <p className="text-[#4A465F]/40 text-xs font-bold uppercase tracking-widest">Daily Progress</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-5xl font-black text-[#4A465F] mb-1">
              {Math.floor(stats.daily.daily_minutes / 60)}h {stats.daily.daily_minutes % 60}m
            </div>
            <div className="text-[#4A465F]/40 text-xs font-bold uppercase tracking-widest">Time Studied Today</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Daily Goal</span>
              <span className="text-sm font-black text-[#4A465F]">{Math.floor(stats.daily.daily_minutes / 60)}h / 4h</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-3 overflow-hidden border border-[#4A465F]/5">
              <motion.div
                className="bg-gradient-to-r from-[#6FB7B4] to-[#5EC2B7] h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.daily.daily_minutes / 240) * 100, 100)}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Weekly Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#4A465F]/5"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#4A465F]/5 rounded-2xl flex items-center justify-center text-[#4A465F]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#4A465F]">Weekly Trend</h3>
            <p className="text-[#4A465F]/40 text-xs font-bold uppercase tracking-widest">Last 7 Days</p>
          </div>
        </div>

        <div className="h-40 flex items-end justify-between gap-2 px-2">
          {stats.weekly.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-[#4A465F]/20 font-bold text-sm italic">
              No data for this week
            </div>
          ) : (
            stats.weekly.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="relative w-full flex justify-center items-end h-32">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.total / maxWeekly) * 100}%` }}
                    className="w-full max-w-[12px] bg-[#5EC2B7] rounded-full opacity-40 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute -top-8 bg-[#4A465F] text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                    {Math.round(day.total)}m
                  </div>
                </div>
                <span className="text-[10px] font-black text-[#4A465F]/30 uppercase">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Top Subjects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#4A465F]/5"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#6FB7B4]/10 rounded-2xl flex items-center justify-center text-[#6FB7B4]">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#4A465F]">Subject Stats</h3>
            <p className="text-[#4A465F]/40 text-xs font-bold uppercase tracking-widest">Focus Areas</p>
          </div>
        </div>

        <div className="space-y-5">
          {stats.subjects.length === 0 ? (
            <div className="text-center py-10 text-[#4A465F]/20 font-bold italic">
              Start a session to see stats
            </div>
          ) : (
            stats.subjects.slice(0, 4).map((sub, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#4A465F]">{sub.subject}</span>
                  <span className="text-[10px] font-black text-[#4A465F]/40">{Math.round(sub.total)} min</span>
                </div>
                <div className="w-full bg-[#F5F5F5] h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(sub.total / stats.quick.total_hours / 60) * 100 || 0}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: getSubjectColor(idx) }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#4A465F] p-6 rounded-[2rem] text-white">
          <Clock className="w-6 h-6 mb-4 opacity-40" />
          <div className="text-2xl font-black">{stats.quick.total_hours}h</div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">Total Focus</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-[#4A465F]/5">
          <Award className="w-6 h-6 mb-4 text-[#5EC2B7]" />
          <div className="text-2xl font-black text-[#4A465F]">{stats.quick.total_sessions}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#4A465F]/40">Sessions</div>
        </div>
      </div>
    </div>
  )
}
