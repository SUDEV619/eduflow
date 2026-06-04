'use client'

import { motion, useScroll, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, Menu, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'

export default function TopNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [unreadCount, setUnreadCount] = useState<number | null>(null)
  const { scrollY } = useScroll()
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    // Use the newer FM 'on' method for scroll tracking
    const unsubscribe = scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20)
    })
    return () => unsubscribe()
  }, [scrollY])

  useEffect(() => {
    if (mounted && user) {
        fetchUnreadCount()
    }
  }, [mounted, user])

  const fetchUnreadCount = async () => {
    try {
        const response = await apiClient.get('/api/notifications/unread-count/')
        setUnreadCount(response.data.count)
    } catch (error) {
        console.error('Failed to fetch unread count:', error)
    }
  }

  // Simple helper to avoid mismatch
  const badgeDisplay = mounted && unreadCount !== null && unreadCount > 0 ? unreadCount.toString() : null

  return (
    <motion.nav
      className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-500 ${
        isScrolled 
          ? 'border-[#4A465F]/10 shadow-2xl shadow-[#4A465F]/5 bg-white/90' 
          : 'border-transparent bg-[#F5F5F5]/50'
      }`}
    >
      <div className="px-6 md:px-12 py-5">
        <div className="flex items-center justify-between gap-6">
          {/* Search Bar - Expressive and Responsive */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 max-w-lg hidden sm:block"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-[#6FB7B4]/5 blur-xl group-focus-within:bg-[#6FB7B4]/10 transition-all rounded-3xl" />
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#4A465F]/20 group-focus-within:text-[#6FB7B4] transition-colors" />
              <input
                type="text"
                placeholder="Search across your workspace..."
                className="relative w-full pl-16 pr-8 py-4 bg-white/60 backdrop-blur-md border border-[#4A465F]/5 rounded-[2rem] focus:outline-none focus:border-[#6FB7B4]/30 focus:ring-8 focus:ring-[#6FB7B4]/5 transition-all duration-500 font-bold placeholder-[#4A465F]/20 text-[#4A465F]"
              />
            </div>
          </motion.div>

          <div className="sm:hidden flex-1">
             {/* Mobile specific search icon/button */}
             <button className="p-4 rounded-2xl bg-white border border-[#4A465F]/5 shadow-sm text-[#4A465F]/40">
               <Search className="w-6 h-6" />
             </button>
          </div>

          {/* Right Section - Essential Actions */}
          <div className="flex items-center gap-3 md:gap-6 relative">
            {/* Notifications Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/notifications')}
                className="relative p-4 rounded-[1.5rem] border transition-all duration-500 overflow-hidden group bg-white border-[#4A465F]/5 hover:border-[#6FB7B4]/30 text-[#4A465F]/70 shadow-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6FB7B4]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Bell className="w-6 h-6" />

                {/* Badge using suppression or mounted check */}
                <AnimatePresence>
                  {badgeDisplay && (
                    <motion.div
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-[#5EC2B7] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg z-10"
                    >
                      {badgeDisplay}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/profile">
                <motion.div
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-4 p-2 pl-2 pr-6 bg-white rounded-[1.5rem] border border-[#4A465F]/5 hover:border-[#6FB7B4]/30 hover:shadow-2xl transition-all duration-500 cursor-pointer shadow-sm group"
                >
                  <div className="relative w-10 h-10 md:w-12 md:h-12">
                     <div className="absolute inset-0 bg-gradient-to-br from-[#6FB7B4] to-[#5EC2B7] rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                     <div className="relative w-full h-full bg-gradient-to-br from-[#6FB7B4] to-[#5EC2B7] rounded-xl flex items-center justify-center text-white shadow-inner">
                       <User className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  </div>

                  <div className="hidden lg:block">
                    <div className="text-sm font-black text-[#4A465F] leading-tight tracking-tight truncate max-w-[120px]">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-[10px] font-black text-[#6FB7B4] uppercase tracking-[0.2em] mt-0.5">Premium</div>
                  </div>
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (confirm('Are you sure you want to log out?')) {
                    logout()
                  }
                }}
                className="p-4 rounded-2xl bg-rose-50 text-rose-400 border border-rose-100 hover:bg-rose-100 transition-all shadow-sm hidden md:flex items-center justify-center"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Mobile Menu Icon */}
            <button className="lg:hidden p-4 rounded-2xl bg-[#4A465F]/5 text-[#4A465F]/40 hover:bg-[#4A465F]/10 hover:text-[#4A465F] transition-all">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}