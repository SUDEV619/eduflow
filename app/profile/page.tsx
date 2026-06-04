'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Sidebar from '../dashboard/components/Sidebar'
import TopNavbar from '../dashboard/components/TopNavbar'
import ProfileBackground from './components/ProfileBackground'
import ProfileHeader from './components/ProfileHeader'
import PersonalInfo from './components/PersonalInfo'
import StudyStats from './components/StudyStats'
import AchievementsGrid from './components/AchievementsGrid'
import ActivityTimeline from './components/ActivityTimeline'
import apiClient from '@/lib/apiClient'
import { ProfileData, ProfileStats, TimelineItem } from './lib/types'
import { Loader2 } from 'lucide-react'
import { userProfile as mockData } from './lib/data'

export default function ProfilePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [profileRes, statsRes, timelineRes] = await Promise.all([
        apiClient.get('/api/profile/'),
        apiClient.get('/api/profile/stats/'),
        apiClient.get('/api/profile/timeline/')
      ])
      
      setProfile(profileRes.data)
      setStats(statsRes.data)
      setTimeline(timelineRes.data.timeline)
    } catch (error) {
      console.error('Failed to fetch profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (updatedData: Partial<ProfileData>) => {
    try {
        const response = await apiClient.patch('/api/profile/update/', updatedData)
        setProfile(prev => prev ? { ...prev, ...response.data } : null)
        return response.data
    } catch (error) {
        console.error('Failed to update profile:', error)
        throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#6FB7B4] animate-spin" />
          <p className="text-lg font-black text-[#4A465F]/40 uppercase tracking-widest text-center px-4">
            Customizing Your Workspace...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] relative overflow-hidden">
      <ProfileBackground />
      
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
            {/* 1. Profile Hero Section */}
            {profile && <ProfileHeader profile={profile} />}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Left Column (Stats and Forms) */}
              <div className="lg:col-span-8 space-y-12">
                {/* 2. Personal Information Section */}
                {profile && (
                    <PersonalInfo 
                        profile={profile} 
                        onUpdate={handleProfileUpdate} 
                    />
                )}

                {/* 3. Study Stats Overview Section */}
                {stats && <StudyStats stats={stats} />}
              </div>

              {/* Right Column (Achievements and History) */}
              <div className="lg:col-span-4 space-y-12">
                {/* 4. Achievements & Badges Section - Keep mock for now as backend doesn't have it yet */}
                <AchievementsGrid achievements={mockData.achievements} />

                {/* 5. Activity Timeline Section */}
                <ActivityTimeline timeline={timeline} />
              </div>
            </div>
          </motion.main>
        </div>
      </div>
    </div>
  )
}
