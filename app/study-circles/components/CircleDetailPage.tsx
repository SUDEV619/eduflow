
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MessageSquare, Folder, Users as UsersIcon, Settings, LogOut, ChevronRight, Loader2, UserCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'
import Discussion from './Discussion'
import ResourceVault from './ResourceVault'
import MembersList from './MembersList'
import JoinRequestsList from './JoinRequestsList'
import SettingsModal from './SettingsModal'
import toast from 'react-hot-toast'

interface CircleDetailPageProps {
  circleId: number;
  onBack: () => void;
}

export default function CircleDetailPage({ circleId, onBack }: CircleDetailPageProps) {
  const { token, user } = useAuth()
  const [activeTab, setActiveTab] = useState<'discussion' | 'vault' | 'members' | 'requests'>('discussion')
  const [circle, setCircle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLeaving, setIsLeaving] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const fetchCircle = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await apiClient.get(`/api/circles/${circleId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCircle(res.data)
    } catch (error) {
      console.error('Failed to fetch circle:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCircle()
  }, [circleId, token])

  const handleLeave = async () => {
    if (!token || isLeaving) return
    if (!window.confirm('Are you sure you want to leave this study circle?')) return
    
    setIsLeaving(true)
    try {
      await apiClient.post(`/api/circles/${circleId}/leave/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('You have left the circle.')
      onBack()
    } catch (error: any) {
      console.error('Failed to leave circle:', error)
      const message = error.response?.data?.error || 'Failed to leave circle'
      toast.error(message)
    } finally {
      setIsLeaving(false)
    }
  }

  const tabs = [
    { id: 'discussion', label: 'Discussion', icon: MessageSquare, show: true },
    { id: 'vault', label: 'Resource Vault', icon: Folder, show: true },
    { id: 'members', label: 'Circle Members', icon: UsersIcon, show: true },
    { id: 'requests', label: 'Join Requests', icon: UserCheck, show: circle?.is_admin },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#4A465F]/40">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold">Loading Circle Details...</p>
      </div>
    )
  }

  if (!circle) return null

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Top Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-12 border-b border-[#4A465F]/10">
        <div className="space-y-4">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={onBack}
            className="flex items-center gap-2 text-[#4A465F]/40 font-bold hover:text-[#4A465F] transition-colors uppercase tracking-widest text-xs"
          >
            <ArrowLeft className="w-5 h-5" />
            Study Circles
          </motion.button>
          
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#6FB7B4] to-[#A8DAD6] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-[#6FB7B4]/20 border-4 border-white">
              {circle.name.charAt(0)}
            </div>
            
            <div className="space-y-3 pb-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#4A465F]/5 rounded-full text-[10px] font-black text-[#4A465F] uppercase tracking-tighter">
                  {circle.subject || 'General'}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">
                  <UsersIcon className="w-3.5 h-3.5" />
                  {circle.member_count} Members
                </div>
                {circle.is_admin && (
                  <span className="px-3 py-1 bg-[#5EC2B7]/10 text-[#5EC2B7] rounded-full text-[9px] font-black uppercase tracking-tighter">
                    Creator / Admin
                  </span>
                )}
              </div>
              <h1 className="text-5xl font-black text-[#4A465F] tracking-tighter leading-tight">{circle.name}</h1>
              <p className="text-[#2E2E2E]/50 text-base font-bold line-clamp-1 max-w-xl">{circle.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-2xl bg-white border border-[#4A465F]/10 text-[#4A465F]/40 hover:text-[#5EC2B7] hover:bg-white shadow-sm transition-all"
          >
            <Settings className="w-6 h-6" />
          </motion.button>
          {!circle.is_admin && (
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 5px 15px -5px rgba(225, 29, 72, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLeave}
              disabled={isLeaving}
              className="px-8 py-3 rounded-2xl bg-[#4A465F]/5 text-[#4A465F]/40 hover:text-white hover:bg-rose-500 font-extrabold flex items-center gap-2 transition-all group disabled:opacity-50"
            >
              {isLeaving ? 'Leaving...' : 'Leave Circle'}
              {!isLeaving && <LogOut className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all" />}
            </motion.button>
          )}
        </div>
      </div>

      {/* Tab Navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-2 bg-[#F5F5F5]/50 p-4 rounded-[2.5rem] border border-[#4A465F]/5">
            {tabs.filter(t => t.show).map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const tabId = tab.id as any
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tabId)}
                  whileHover={{ x: isActive ? 0 : 5 }}
                  className={`flex items-center justify-between px-6 py-5 rounded-3xl transition-all duration-300 font-black relative overflow-hidden group ${
                    activeTab === tabId
                      ? 'bg-white shadow-xl shadow-[#4A465F]/5 text-[#4A465F]' 
                      : 'text-[#4A465F]/40 hover:text-[#4A465F]'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-2.5 rounded-xl transition-all ${
                      activeTab === tabId ? 'bg-[#5EC2B7] text-white' : 'bg-transparent text-[#4A465F]/20 group-hover:text-[#4A465F]/40'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {tab.label}
                  </div>
                  {activeTab === tabId && <ChevronRight className="w-5 h-5 relative z-10 text-[#6FB7B4]" />}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm overflow-hidden min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'discussion' && (
                <motion.div
                  key="discussion"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Discussion circleId={circleId.toString()} />
                </motion.div>
              )}
              {activeTab === 'vault' && (
                <motion.div
                  key="vault"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ResourceVault circleId={circleId.toString()} />
                </motion.div>
              )}
              {activeTab === 'members' && (
                <motion.div
                  key="members"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <MembersList circleId={circleId.toString()} isAdmin={circle.is_admin} />
                </motion.div>
              )}
              {activeTab === 'requests' && (
                <motion.div
                  key="requests"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <JoinRequestsList 
                    circleId={circleId.toString()} 
                    onActionComplete={fetchCircle}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {token && (
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          circleId={circleId}
          isAdmin={circle.is_admin}
          onCircleUpdate={fetchCircle}
          onLeaveOrDelete={onBack}
          token={token}
        />
      )}
    </div>
  )
}
