'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bell, Search, Filter, Trash2, CheckCircle, Settings, LayoutList, Loader2, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../dashboard/components/Sidebar'
import TopNavbar from '../dashboard/components/TopNavbar'
import NotificationsBackground from './components/NotificationsBackground'
import NotificationSettings from './components/NotificationSettings'
import NotificationItem from './components/NotificationItem'
import { AppNotification } from './lib/data'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

function NotificationsContent() {
  const { token, isAuthenticated } = useAuth()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'list'
  
  const [activeTab, setActiveTab] = useState(initialTab)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // New Filter States
  const [filterType, setFilterType] = useState('')
  const [filterReadStatus, setFilterReadStatus] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications()
    }
  }, [filterType, filterReadStatus, isAuthenticated])

  // Debugging log for state changes
  useEffect(() => {
    console.log("Current Notifications State:", notifications);
  }, [notifications]);

  const fetchNotifications = async () => {
    if (!token) {
      console.warn("No authentication token found. Delaying fetch.")
      return
    }

    try {
      setLoading(true)
      console.log("FETCHING NOTIFICATIONS - TOKEN:", token); // DEBUG
      
      const params = new URLSearchParams()
      if (filterType) params.append('type', filterType)
      if (filterReadStatus) params.append('is_read', filterReadStatus)
      
      const response = await apiClient.get(`/api/notifications/?${params.toString()}`)
      console.log("API DATA RECEIVED:", response.data); // DEBUG
      
      // Support both wrapped and unwrapped data
      const data = response.data.data || response.data;
      
      if (Array.isArray(data)) {
        setNotifications(data)
      } else {
        console.error("Invalid notification data format:", data)
        setNotifications([])
      }
    } catch (error: any) {
      console.error("ANALYTICS FETCH ERROR:", error);
      console.error("RESPONSE DATA:", error?.response?.data);
      console.error("STATUS CODE:", error?.response?.status);

      const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error.message;
      toast.error(`Failed to load notifications: ${errorMsg}`);
    } finally {
      setLoading(false)
    }
  }

  // Sync tab with URL if needed, or just use initial
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) setActiveTab(tab)
  }, [searchParams])

  const filteredNotifications = useMemo(() => {
    // Filter by search query
    const filtered = notifications.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort unread first, then by date (backend already handles date, so we just nudge unread to top)
    return [...filtered].sort((a, b) => {
        if (a.is_read === b.is_read) return 0;
        return a.is_read ? 1 : -1;
    });
  }, [notifications, searchQuery])

  const groupedNotifications = useMemo(() => {
    return {
      Today: filteredNotifications.filter(n => n.date_label === 'Today'),
      Yesterday: filteredNotifications.filter(n => n.date_label === 'Yesterday'),
      Earlier: filteredNotifications.filter(n => n.date_label === 'Earlier'),
    }
  }, [filteredNotifications])

  const markAllAsRead = async () => {
    try {
        await apiClient.post('/api/notifications/mark-all-read/')
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        toast.success('All notifications marked as read')
    } catch (error) {
        console.error('Failed to mark all as read:', error)
    }
  }

  const clearAll = async () => {
    alert('Clear all is not implemented in backend yet.')
  }

  const handleRead = async (id: string | number, db_id?: number) => {
    try {
        await apiClient.post(`/api/notifications/mark-read/${id}/`, { db_id })
        
        // Update state locally for instant feedback
        setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        toast.success('Marked as read')
    } catch (error) {
        console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id: string | number, db_id?: number) => {
    try {
        await apiClient.delete(`/api/notifications/delete/${id}/`, { data: { db_id } })
        setNotifications(prev => prev.filter(n => n.id !== id))
        toast.success('Notification deleted')
    } catch (error) {
        console.error('Failed to delete notification:', error)
    }
  }

  return (
    <div className="flex">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <TopNavbar />
        
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="p-8 max-w-7xl mx-auto space-y-12 pb-24"
        >
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[2rem] bg-white shadow-xl shadow-[#6FB7B4]/10 border border-[#6FB7B4]/10 flex items-center justify-center text-[#6FB7B4] relative">
                  <Bell className="w-8 h-8" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#5EC2B7] text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-white">
                      {notifications.filter(n => !n.is_read).length}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-4xl font-black text-[#4A465F] tracking-tight">Notification Center</h1>
                  <p className="text-base font-bold text-[#4A465F]/40 uppercase tracking-[0.2em] flex items-center gap-2">
                     <span>Alerts</span>
                     <span className="w-1.5 h-1.5 rounded-full bg-[#6FB7B4]" />
                     <span>Reminders</span>
                     <span className="w-1.5 h-1.5 rounded-full bg-[#6FB7B4]" />
                     <span>Achievements</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex bg-white/50 backdrop-blur-xl p-2 rounded-[2rem] border border-[#4A465F]/5 shadow-sm">
                 {[
                   { id: 'list', label: 'Dashboard', icon: LayoutList },
                   { id: 'settings', label: 'Preferences', icon: Settings }
                 ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.5rem] font-black transition-all ${
                       activeTab === tab.id 
                         ? 'bg-[#4A465F] text-white shadow-xl shadow-[#4A465F]/20' 
                         : 'text-[#4A465F]/40 hover:text-[#4A465F] hover:bg-white'
                     }`}
                   >
                     <tab.icon className="w-5 h-5" />
                     <span className="text-xs uppercase tracking-widest">{tab.label}</span>
                   </button>
                 ))}
               </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-12"
              >
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A465F]/20 group-hover:text-[#6FB7B4] transition-colors" />
                    <input 
                      type="text"
                      placeholder="Search alerts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] border border-[#4A465F]/5 shadow-sm focus:outline-none focus:border-[#6FB7B4]/40 focus:ring-4 focus:ring-[#6FB7B4]/5 transition-all font-bold placeholder-[#4A465F]/20"
                    />
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                     {/* Type Filter */}
                     <div className="relative">
                        <select 
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="appearance-none pl-8 pr-12 py-6 bg-white rounded-[2rem] border border-[#4A465F]/5 shadow-sm focus:outline-none focus:border-[#6FB7B4]/40 font-black text-sm uppercase tracking-widest text-[#4A465F]/50 cursor-pointer transition-all"
                        >
                          <option value="">All Types</option>
                          <option value="study">Study</option>
                          <option value="mock">Mock Test</option>
                          <option value="circle">Circle</option>
                          <option value="admin">Admin</option>
                          <option value="system">System</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/20 pointer-events-none" />
                     </div>

                     {/* Status Filter */}
                     <div className="relative">
                        <select 
                          value={filterReadStatus}
                          onChange={(e) => setFilterReadStatus(e.target.value)}
                          className="appearance-none pl-8 pr-12 py-6 bg-white rounded-[2rem] border border-[#4A465F]/5 shadow-sm focus:outline-none focus:border-[#6FB7B4]/40 font-black text-sm uppercase tracking-widest text-[#4A465F]/50 cursor-pointer transition-all"
                        >
                          <option value="">All Status</option>
                          <option value="true">Read</option>
                          <option value="false">Unread</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/20 pointer-events-none" />
                     </div>

                     <button 
                       onClick={markAllAsRead}
                       className="flex items-center gap-3 h-[72px] px-8 bg-white rounded-[2rem] border border-[#4A465F]/5 shadow-sm text-[#4A465F]/50 hover:text-[#5EC2B7] hover:bg-white font-black group transition-all"
                     >
                       <CheckCircle className="w-5 h-5" />
                       <span className="text-sm uppercase tracking-widest">Mark All Read</span>
                     </button>
                     <button 
                       onClick={clearAll}
                       className="flex items-center gap-3 h-[72px] px-8 bg-rose-50 text-rose-500 rounded-[2rem] border border-rose-100 shadow-sm hover:bg-rose-500 hover:text-white font-black transition-all"
                     >
                       <Trash2 className="w-5 h-5" />
                       <span className="text-sm uppercase tracking-widest">Clear All</span>
                     </button>
                  </div>
                </div>

                {/* Grouped List */}
                <div className="space-y-16">
                   {loading ? (
                     <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-12 h-12 text-[#6FB7B4] animate-spin" />
                     </div>
                   ) : filteredNotifications.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-24 space-y-8 bg-white/50 rounded-[4rem] border-2 border-dashed border-[#4A465F]/5 opacity-40 text-center">
                        <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center text-[#4A465F]">
                          <Bell className="w-10 h-10" />
                        </div>
                        <p className="text-2xl font-black text-[#4A465F]">
                            {searchQuery || filterType || filterReadStatus ? "No matching notifications found." : "Your inbox is perfectly clean!"}
                        </p>
                     </div>
                   ) : (
                     Object.entries(groupedNotifications).map(([date, items]) => (
                       items.length > 0 && (
                         <div key={date} className="space-y-8 px-4">
                           <div className="flex items-center gap-6">
                             <span className="text-sm font-black text-[#4A465F]/30 uppercase tracking-[0.3em]">{date}</span>
                             <div className="h-[2px] flex-1 bg-gradient-to-r from-[#4A465F]/5 to-transparent rounded-full" />
                           </div>
                           
                           <div className="grid grid-cols-1 gap-4">
                             {items.map(notif => (
                               <NotificationItem 
                                 key={notif.id} 
                                 notification={notif} 
                                 onRead={handleRead}
                                 onDelete={handleDelete}
                               />
                             ))}
                           </div>
                         </div>
                       )
                     ))
                   )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <NotificationSettings />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">
      <NotificationsBackground />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 text-[#6FB7B4] animate-spin" />
        </div>
      }>
        <NotificationsContent />
      </Suspense>
    </div>
  )
}
