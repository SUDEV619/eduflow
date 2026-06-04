'use client'

import { motion } from 'framer-motion'
import { Search, Bell, User, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'
import { useRouter } from 'next/navigation'

export default function AdminTopNavbar() {
  const { user, token } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    if (!token) return
    try {
      const res = await apiClient.get('/api/notifications/unread-count/')
      if (res.data.status === 'success') {
        setUnreadCount(res.data.count)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    // Optional: Refresh every minute
    const interval = setInterval(fetchUnreadCount, 60000)
    return () => clearInterval(interval)
  }, [token])

  return (
    <nav className="sticky top-0 z-30 bg-[#F5F5F5]/80 backdrop-blur-md border-b border-[#4A465F]/5 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/30 group-focus-within:text-[#5EC2B7] transition-colors" />
            <input
              type="text"
              placeholder="Search administration..."
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-[#4A465F]/5 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#5EC2B7]/5 focus:border-[#5EC2B7]/20 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin/notifications')}
            className="p-2.5 rounded-xl bg-white border border-[#4A465F]/5 text-[#4A465F]/60 relative group"
          >
            <Bell className="w-5 h-5 group-hover:text-[#5EC2B7] transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {unreadCount === 0 && (
               <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full border-2 border-white" />
            )}
          </motion.button>

          <div className="h-8 w-px bg-[#4A465F]/10 mx-2" />

          <Link href="/admin/settings">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-1.5 pr-4 bg-white rounded-xl border border-[#4A465F]/5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#4A465F] flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[#4A465F] tracking-tight">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-[#5EC2B7] uppercase tracking-wider">Super Admin</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  )
}
