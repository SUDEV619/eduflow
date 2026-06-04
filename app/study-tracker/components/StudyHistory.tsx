'use client'

import { motion } from 'framer-motion'
import { Clock, Calendar, FileText, TrendingUp } from 'lucide-react'

interface StudyHistoryProps {
  sessions: any[]
}

export default function StudyHistory({ sessions }: StudyHistoryProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': 'from-blue-400 to-blue-500',
      'Physics': 'from-purple-400 to-purple-500',
      'Chemistry': 'from-green-400 to-green-500',
      'Biology': 'from-emerald-400 to-emerald-500',
      'Computer Science': 'from-indigo-400 to-indigo-500',
      'English': 'from-pink-400 to-pink-500',
      'History': 'from-amber-400 to-amber-500',
      'Geography': 'from-teal-400 to-teal-500',
      'Economics': 'from-orange-400 to-orange-500',
      'Psychology': 'from-violet-400 to-violet-500'
    }
    return colors[subject as keyof typeof colors] || 'from-accent to-button'
  }

  const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0)
  const todaySessions = sessions.filter(session => {
    const today = new Date()
    const sessionDate = new Date(session.date)
    return sessionDate.toDateString() === today.toDateString()
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-button rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text">Study History</h3>
              <p className="text-text/60 text-sm">Your recent learning sessions</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-accent hover:text-accent/80 text-sm font-medium"
          >
            View All
          </motion.button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center p-4 bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl"
          >
            <div className="text-2xl font-bold text-text">{sessions.length}</div>
            <div className="text-xs text-text/60">Total Sessions</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center p-4 bg-gradient-to-br from-button/10 to-button/20 rounded-2xl"
          >
            <div className="text-2xl font-bold text-text">{Math.floor(totalStudyTime / 60)}h</div>
            <div className="text-xs text-text/60">Total Time</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center p-4 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl"
          >
            <div className="text-2xl font-bold text-text">{todaySessions.length}</div>
            <div className="text-xs text-text/60">Today</div>
          </motion.div>
        </div>

        {/* Sessions List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sessions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">📚</div>
              <div className="text-lg font-medium text-text mb-2">No study sessions yet</div>
              <div className="text-text/60">Start your first focus session to see your progress here</div>
            </motion.div>
          ) : (
            sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5, scale: 1.01 }}
                className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-all duration-300 cursor-pointer group"
              >
                {/* Subject Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${getSubjectColor(session.subject)} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">
                    {session.subject.charAt(0)}
                  </span>
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-text group-hover:text-accent transition-colors duration-300 truncate">
                      {session.subject}
                    </h4>
                    <span className="text-sm text-text/60 flex-shrink-0">{formatDate(session.date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-text/60">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration} min</span>
                    </div>
                    
                    {session.topic && (
                      <div className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{session.topic}</span>
                      </div>
                    )}
                  </div>
                  
                  {session.notes && (
                    <div className="mt-2 text-xs text-text/60 bg-gray-50/50 rounded-lg p-2 truncate">
                      {session.notes}
                    </div>
                  )}
                </div>

                {/* Duration Badge */}
                <div className="flex-shrink-0">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    session.duration >= 60 ? 'bg-green-100 text-green-700' :
                    session.duration >= 30 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {session.duration >= 60 ? 'Long' : session.duration >= 30 ? 'Medium' : 'Short'}
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
          )}
        </div>

        {/* Weekly Progress */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-accent/10 to-button/10 rounded-2xl p-4 border border-accent/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text/70 mb-1">This Week's Progress</div>
                <div className="text-lg font-bold text-text">
                  {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m completed
                </div>
              </div>
              <div className="flex items-center space-x-2 text-accent">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">+15% vs last week</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}