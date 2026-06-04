'use client'

import { motion } from 'framer-motion'
import { Clock, BookOpen, Target } from 'lucide-react'
import { DashboardData } from '../lib/types'
import { formatDistanceToNow, parseISO } from 'date-fns'
import Link from 'next/link'

interface RecentActivityProps {
  data: DashboardData | null;
}

export default function RecentActivity({ data }: RecentActivityProps) {
  const sessions = data?.recent_activity.study_sessions || []
  
  const formatTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
    } catch {
      return dateStr
    }
  }

  const formatMinutes = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    if (hrs === 0) return `${mins} min`
    return `${hrs}h ${mins}m`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-text mb-2">Recent Activity</h3>
            <p className="text-text/60 text-sm">Your latest study sessions</p>
          </div>
          <Link href="/analytics">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-accent hover:text-accent/80 text-sm font-medium"
            >
              View All
            </motion.button>
          </Link>
        </div>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, scale: 1.02 }}
                className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-all duration-300 cursor-pointer group"
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br from-accent to-button rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-text group-hover:text-accent transition-colors duration-300">
                      {session.subject_display}
                    </h4>
                    <span className="text-sm text-text/60">{formatTimeAgo(session.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-text/60">
                      <Clock className="w-4 h-4" />
                      <span>{formatMinutes(session.duration)}</span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent`}>
                      Study
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <motion.div
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ x: 3 }}
                >
                  <div className="w-6 h-6 text-text/40">→</div>
                </motion.div>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center text-text/40 font-medium italic">
                No recent study sessions found. Start learning!
            </div>
          )}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-accent/10 to-button/10 rounded-2xl p-4 border border-accent/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text/70 mb-1">Today's Progress</div>
              <div className="text-lg font-bold text-text">
                {formatMinutes(data?.overview.today_minutes || 0)} completed
              </div>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}