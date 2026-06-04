
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Sidebar from '../dashboard/components/Sidebar'
import TopNavbar from '../dashboard/components/TopNavbar'
import FocusTimer from './components/FocusTimer'
import SessionControls from './components/SessionControls'
import StudyHistory from './components/StudyHistory'
import ProductivityInsights from './components/ProductivityInsights'
import StudyBackground from './components/StudyBackground'
import { useAuth } from '../context/AuthContext'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

export default function StudyTrackerPage() {
  const { token } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [stats, setData] = useState<any>({
    daily: { daily_minutes: 0, daily_hours: 0 },
    weekly: [],
    subjects: [],
    quick: { total_hours: 0, total_sessions: 0, avg_minutes_per_day: 0 }
  })

  const [currentSession, setCurrentSession] = useState({
    subject: '',
    topic: '',
    notes: '',
    duration: 0, // in seconds
    originalDuration: 0, // in seconds
    type: 'pomodoro'
  })

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission()
      }
    }
  }

  const playSound = () => {
    const audio = new Audio("/sounds/complete.mp3")
    audio.volume = 0.6
    audio.play().catch(() => {
      console.warn("Audio blocked until user interaction")
    })
  }

  const showNotification = () => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Session Complete 🎯", {
        body: "Your study session has been saved.",
        icon: "/favicon.ico"
      })
    }
  }

  const triggerVisual = () => {
    setShowComplete(true)
    setTimeout(() => setShowComplete(false), 2500)
  }

  const fetchAllStats = async () => {
    if (!token) return
    try {
      const [daily, weekly, subjects, quick] = await Promise.all([
        apiClient.get('/api/tracker/daily/', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get('/api/tracker/weekly/', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get('/api/tracker/subjects/', { headers: { Authorization: `Bearer ${token}` } }),
        apiClient.get('/api/tracker/stats/', { headers: { Authorization: `Bearer ${token}` } })
      ])

      setData({
        daily: daily.data,
        weekly: weekly.data.data,
        subjects: subjects.data.data,
        quick: quick.data
      })
    } catch (error) {
      console.error('Failed to fetch study stats:', error)
    }
  }

  useEffect(() => {
    fetchAllStats()
    requestNotificationPermission()
  }, [token])

  const handleSessionComplete = async (durationMinutes: number, sessionType: string) => {
    if (!token || !currentSession.subject) return

    try {
      await apiClient.post('/api/tracker/save/', {
        duration: durationMinutes,
        subject: currentSession.subject,
        type: sessionType,
        notes: currentSession.notes || currentSession.topic || ""
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Success feedback
      playSound()
      triggerVisual()
      showNotification()
      toast.success("Session completed and saved 🎯", {
        style: {
          background: '#F5F5F5',
          color: '#4A465F',
          border: '1px solid #6FB7B4',
          fontWeight: 'bold',
        }
      })

      // Reset current session except subject for convenience
      setCurrentSession(prev => ({
        ...prev,
        notes: '',
        topic: '',
        duration: 0
      }))

      // Refresh all stats
      fetchAllStats()
    } catch (error) {
      console.error('Failed to save session:', error)
      toast.error('Failed to save study session.', {
        style: {
          background: '#F5F5F5',
          color: '#F43F5E',
          border: '1px solid #F43F5E',
          fontWeight: 'bold',
        }
      })
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StudyBackground />
      
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-24 right-8 z-[100] bg-[#F5F5F5] border border-[#6FB7B4] p-6 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-[#5EC2B7]/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <div className="font-black text-[#4A465F]">Session Completed!</div>
              <div className="text-sm text-[#4A465F]/60 font-medium">Your progress has been saved.</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 space-y-8"
          >
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-[#4A465F] tracking-tight">Study Tracker</h1>
              <p className="text-lg text-[#4A465F]/60 font-medium">Focus, track, and improve your learning sessions</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <FocusTimer 
                  currentSession={currentSession}
                  onComplete={handleSessionComplete}
                />
                <SessionControls 
                  currentSession={currentSession}
                  setCurrentSession={setCurrentSession}
                />
              </div>
              
              <div className="space-y-8">
                <ProductivityInsights stats={stats} />
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  )
}
