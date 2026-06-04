'use client'

import { motion } from 'framer-motion'
import { Users, MessageCircle, TrendingUp } from 'lucide-react'
import { DashboardData } from '../lib/types'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface StudyCirclePreviewProps {
  data: DashboardData | null;
}

export default function StudyCirclePreview({ data }: StudyCirclePreviewProps) {
  const router = useRouter()
  const circles = data?.circles || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-text mb-2">My Study Circles</h3>
            <p className="text-text/60 text-sm">Collaborate with peers</p>
          </div>
          <Link href="/study-circles">
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
          {circles.length > 0 ? (
            circles.map((circle, index) => (
              <motion.div
                key={circle.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: -5, scale: 1.02 }}
                onClick={() => router.push(`/study-circles/${circle.id}`)}
                className="flex items-center space-x-4 p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-all duration-300 cursor-pointer group"
              >
                {/* Avatar */}
                <div className={`w-12 h-12 bg-gradient-to-br from-accent to-button rounded-2xl flex items-center justify-center shadow-lg relative`}>
                  <span className="text-xl font-bold text-white">{circle.name.charAt(0)}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-text group-hover:text-accent transition-colors duration-300 truncate max-w-[120px]">
                      {circle.name}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-text/60">
                      <Users className="w-4 h-4" />
                      <span>{circle.members_count} members</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-8 text-center text-text/40 font-medium italic">
                You haven't joined any circles yet.
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Link href="/study-circles">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-accent to-button text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mb-3"
            >
              <Users className="w-5 h-5" />
              <span>Explore Circles</span>
            </motion.button>
          </Link>

          <Link href="/study-circles?action=create">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-white/50 border border-accent/30 text-accent rounded-2xl font-semibold hover:bg-white/70 transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Create New Circle</span>
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-accent/10 to-button/10 rounded-2xl p-4 border border-accent/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-text/70 mb-1">Circles Active</div>
              <div className="text-lg font-bold text-text">{circles.length} Active Hubs</div>
            </div>
            <div className="flex items-center space-x-1 text-accent">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Keep growing!</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}