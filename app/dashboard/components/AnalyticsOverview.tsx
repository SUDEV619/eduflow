'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Clock, Target } from 'lucide-react'
import { DashboardData } from '../lib/types'
import { format, parseISO } from 'date-fns'

interface AnalyticsOverviewProps {
  data: DashboardData | null;
}

export default function AnalyticsOverview({ data }: AnalyticsOverviewProps) {
  const trendData = data?.trend || []
  const maxMinutes = Math.max(...trendData.map(d => d.total), 1)

  const formatDay = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'EEE')
    } catch {
      return dateStr
    }
  }

  const formatHours = (minutes: number) => {
    return (minutes / 60).toFixed(1) + 'h'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-text mb-2">Weekly Overview</h3>
          <p className="text-text/60 text-sm">Your study progress this week</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl p-3 text-center"
          >
            <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
            <div className="text-lg font-bold text-text">
                {data ? formatHours(data.trend.reduce((acc, curr) => acc + curr.total, 0)) : '0h'}
            </div>
            <div className="text-xs text-text/60">This Week</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-button/10 to-button/20 rounded-2xl p-3 text-center"
          >
            <TrendingUp className="w-5 h-5 text-button mx-auto mb-1" />
            <div className="text-lg font-bold text-text">
                {data?.overview.streak || 0}d
            </div>
            <div className="text-xs text-text/60">Streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl p-3 text-center"
          >
            <Target className="w-5 h-5 text-secondary mx-auto mb-1" />
            <div className="text-lg font-bold text-text">
                {data?.overview.focus_score || 0}%
            </div>
            <div className="text-xs text-text/60">Focus Score</div>
          </motion.div>
        </div>

        {/* Custom Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="h-32 bg-gray-50/50 rounded-2xl p-4"
        >
          <div className="flex items-end justify-between h-full space-x-2">
            {trendData.map((item, index) => (
              <div key={item.date} className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.total / maxMinutes) * 80}%` }}
                  transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                  className="w-full bg-gradient-to-t from-accent to-button rounded-t-lg min-h-[4px] relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-text text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {formatHours(item.total)}
                  </div>
                </motion.div>
                <span className="text-[10px] text-text/60 mt-2 uppercase font-bold">{formatDay(item.date)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text/70">Daily Goal Progress</span>
            <span className="text-text font-medium">
                {formatHours(data?.overview.today_minutes || 0)} / 4.0h
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-accent to-button h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((data?.overview.today_minutes || 0) / 240) * 100)}%` }}
              transition={{ duration: 1.5, delay: 0.8 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}