'use client'

import { motion } from 'framer-motion'
import { Clock, ChevronRight, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DashboardData } from '../lib/types'
import { format, parseISO } from 'date-fns'

interface MockTestSectionProps {
  data: DashboardData | null;
}

export default function MockTestSection({ data }: MockTestSectionProps) {
  const router = useRouter()
  const recentAttempts = data?.recent_activity.mock_tests || []

  const viewAll = () => {
    router.push('/mock-tests')
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      whileHover={{ y: -5, scale: 1.01 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-text mb-2">Mock Test Summary</h3>
            <p className="text-text/60 text-sm">Your recent performance</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={viewAll}
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            Practice More
          </motion.button>
        </div>

        {/* Horizontal Scroll for Recent Attempts */}
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-4 min-w-max">
            {recentAttempts.length > 0 ? (
              recentAttempts.map((attempt, index) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="flex-shrink-0 w-72 bg-white/70 rounded-2xl p-5 border border-white/30 hover:bg-white/90 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-button to-secondary rounded-2xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-accent">{attempt.score}</div>
                        <div className="text-[10px] uppercase font-bold text-text/40">Score</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-text group-hover:text-accent transition-colors duration-300 truncate">
                      {attempt.test_title}
                    </h4>
                    <div className="text-xs text-text/60 font-bold uppercase tracking-widest">
                        {formatDate(attempt.date)}
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-4 py-2 bg-accent/10 text-accent rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-accent/20 transition-all"
                    onClick={() => router.push(`/mock-tests/${attempt.id}/results`)}
                  >
                      View Result
                  </motion.button>
                </motion.div>
              ))
            ) : (
              <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-text/40 font-bold uppercase tracking-widest">No tests taken yet</p>
                  <button 
                    onClick={viewAll}
                    className="mt-4 text-accent font-black text-sm uppercase tracking-tighter hover:underline"
                  >
                    Start your first test →
                  </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl border border-accent/10">
            <div className="text-2xl font-black text-text">{recentAttempts.length}</div>
            <div className="text-[10px] font-black text-text/40 uppercase tracking-widest">Recent Attempts</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-button/10 to-button/20 rounded-2xl border border-button/10">
            <div className="text-2xl font-black text-text">
                {recentAttempts.length > 0 ? (recentAttempts.reduce((acc, curr) => acc + curr.score, 0) / recentAttempts.length).toFixed(1) : '0'}
            </div>
            <div className="text-[10px] font-black text-text/40 uppercase tracking-widest">Avg Recent Score</div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}