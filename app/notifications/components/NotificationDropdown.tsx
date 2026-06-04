'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ArrowRight, Settings, Inbox, X, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppNotification } from '../lib/data'
import NotificationItem from './NotificationItem'
import apiClient from '@/lib/apiClient'

interface NotificationDropdownProps {
  onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentNotifications()
  }, [])

  const fetchRecentNotifications = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/notifications/')
      // Show only first 4
      setNotifications(response.data.data.slice(0, 4))
    } catch (error) {
      console.error('Failed to fetch dropdown notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -20, x: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20, x: 20 }}
      className="absolute top-24 right-0 w-[420px] bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-[#4A465F]/15 border border-[#4A465F]/10 z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-8 border-b border-[#4A465F]/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6FB7B4]/10 text-[#6FB7B4] flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#4A465F] tracking-tight">
              Alerts & Notifications
            </h3>
            <span className="text-xs font-black text-[#4A465F]/30 uppercase tracking-widest">
              Stay in the loop
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Link href="/notifications?tab=settings" onClick={onClose}>
             <button className="p-3 rounded-xl bg-[#F5F5F5] text-[#4A465F]/40 hover:text-[#6FB7B4] transition-all">
               <Settings className="w-5 h-5" />
             </button>
           </Link>
           <button 
             onClick={onClose}
             className="p-3 rounded-xl bg-[#F5F5F5] text-[#4A465F]/40 hover:text-rose-500 transition-all hover:rotate-90"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[500px] overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-[#6FB7B4]/20 scrollbar-track-transparent">
        {loading ? (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-[#6FB7B4] animate-spin" />
            </div>
        ) : notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <NotificationItem 
                notification={notif} 
                compact={true} 
              />
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 opacity-30 text-center px-12">
            <Inbox className="w-12 h-12 text-[#4A465F]" />
            <p className="font-bold text-[#4A465F]">No notifications found. You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-[#F5F5F5]/30 mt-auto backdrop-blur-sm border-t border-[#4A465F]/5">
        <Link href="/notifications" onClick={onClose} className="w-full">
          <motion.button
            whileHover={{ x: 5 }}
            className="w-full py-4 rounded-2xl bg-white border border-[#4A465F]/5 text-[#4A465F] font-black text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-xl hover:text-[#6FB7B4] transition-all"
          >
            View All Notifications
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}
