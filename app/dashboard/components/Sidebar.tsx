'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Clock, 
  BarChart3, 
  FileText, 
  Users, 
  User,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Book
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Book, label: 'Study Materials', href: '/study-materials' },
  { icon: Clock, label: 'Study Tracker', href: '/study-tracker' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Mock Tests', href: '/mock-tests' },
  { icon: Users, label: 'Study Circles', href: '/study-circles' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: User, label: 'Profile', href: '/profile' },
  { icon: LogOut, label: 'Log Out', href: '/logout', action: true },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const isActiveHref = (href: string) => {
    if (!pathname) return false
    const normalized = href.endsWith('/') ? href.slice(0, -1) : href
    return pathname === normalized || pathname.startsWith(`${normalized}/`)
  }

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed left-0 top-0 h-full bg-hero transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{
        borderTopRightRadius: '2rem',
        borderBottomRightRadius: '2rem',
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-2xl font-bold text-white"
            >
              EduFlow
            </motion.h1>
          )}

          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-white" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item, index) => {
          const active = isActiveHref(item.href)
          return (
            <Link
              key={item.label}
              href={item.action ? '#' : item.href}
              onClick={(e) => {
                if (item.action) {
                  e.preventDefault()
                  if (confirm('Are you sure you want to log out?')) {
                    window.location.href = '/'
                  }
                }
              }}
              className={`flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                active
                  ? 'bg-[#6FB7B4]/20 text-white shadow-lg shadow-[#6FB7B4]/10' 
                  : item.action 
                    ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-400/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 w-full"
              >
                {/* Active Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#6FB7B4] rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#6FB7B4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <item.icon
                  className={`w-5 h-5 relative z-10 transition-colors ${
                    active ? 'text-[#6FB7B4]' : ''
                  }`}
                />

                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-black text-sm relative z-10 tracking-tight"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-6 left-4 right-4"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#6FB7B4]/10 blur-2xl rounded-full" />
            <div className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Study Streak</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-black text-[#6FB7B4] tracking-tighter shadow-[#6FB7B4]/20 drop-shadow-lg">7</div>
                <div className="text-white/80 text-xs font-bold leading-tight">days<br/>active</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl animate-pulse">🔥</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}