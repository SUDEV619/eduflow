'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TopNavbar from './components/TopNavbar'
import WelcomeSection from './components/WelcomeSection'
import StudyTracker from './components/StudyTracker'
import AnalyticsOverview from './components/AnalyticsOverview'
import RecentActivity from './components/RecentActivity'
import MockTestSection from './components/MockTestSection'
import StudyCirclePreview from './components/StudyCirclePreview'
import ProgressShowcase from './components/ProgressShowcase'
import DashboardBackground from './components/DashboardBackground'
import ProtectedRoute from '../components/ProtectedRoute'
import apiClient from '@/lib/apiClient'
import { DashboardData } from './lib/types'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/dashboard/')
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-lg font-black text-[#4A465F]/40 uppercase tracking-widest">Loading Workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <DashboardBackground />
        
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          
          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}>
            {/* Top Navbar */}
            <TopNavbar />
            
            {/* Dashboard Content */}
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-6 space-y-6"
            >
              {/* Welcome Section */}
              <WelcomeSection data={data} />
              
              {/* Main Dashboard Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <StudyTracker data={data} />
                    <AnalyticsOverview data={data} />
                  </div>
                  <RecentActivity data={data} />
                  <MockTestSection data={data} />
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  <StudyCirclePreview data={data} />
                  <ProgressShowcase data={data} />
                </div>
              </div>
            </motion.main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
