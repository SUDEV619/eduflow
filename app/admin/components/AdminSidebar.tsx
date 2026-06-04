'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  Target, 
  BarChart3, 
  Bell, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldAlert,
  Book
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users Management', href: '/admin/users' },
  { icon: Book, label: 'Study Materials', href: '/admin/study-materials' },
  { icon: FileText, label: 'Question Bank', href: '/admin/questions' },
  { icon: Target, label: 'Mock Tests', href: '/admin/mock-tests' },
  { icon: ShieldAlert, label: 'Study Circles', href: '/admin/study-circles' },
  { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

export default function AdminSidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const isActiveHref = (href: string) => {
    if (!pathname) return false
    return pathname === href
  }

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed left-0 top-0 h-full bg-[#4A465F] transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      } flex flex-col`}
      style={{
        borderTopRightRadius: '2rem',
        borderBottomRightRadius: '2rem',
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-[#5EC2B7] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                EduFlow <span className="text-[#5EC2B7] text-xs align-top ml-0.5">ADMIN</span>
              </h1>
            </motion.div>
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
      <nav className="p-4 flex-1 overflow-y-auto space-y-1.5 scrollbar-hide">
        {adminMenuItems.map((item, index) => {
          const active = isActiveHref(item.href)
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                active
                  ? 'bg-[#5EC2B7]/20 text-white shadow-lg shadow-[#5EC2B7]/10' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3 w-full relative z-10">
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    active ? 'text-[#5EC2B7]' : 'group-hover:text-white'
                  }`}
                />
                
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-sm tracking-tight"
                  >
                    {item.label}
                  </motion.span>
                )}

                {active && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute -inset-2 bg-[#5EC2B7]/5 blur-lg rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </div>
              
              {active && (
                <motion.div
                  layoutId="adminIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#5EC2B7] rounded-r-full"
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              logout()
            }
          }}
          className={`w-full flex items-center space-x-3 p-3.5 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-all duration-300 group`}
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          {!collapsed && <span className="font-bold text-sm tracking-tight">Log Out</span>}
        </button>
      </div>
    </motion.div>
  )
}
