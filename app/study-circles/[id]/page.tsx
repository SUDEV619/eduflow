
'use client'

import { useState, useEffect, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  FileText, 
  Users, 
  ChevronLeft,
  Loader2,
  Lock,
  PlusCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import Discussion from '../components/Discussion'
import ResourceVault from '../components/ResourceVault'
import MembersList from '../components/MembersList'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

type Tab = 'discussion' | 'resources' | 'members'

export default function StudyCircleDetail({ params }: { params: { id: string } }) {
  const { id } = use(params as any) as any
  const { token, user } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<Tab>('discussion')
  const [circle, setCircle] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  const fetchCircle = async () => {
    if (!token) return
    try {
      const res = await apiClient.get(`/api/circles/${id}/`, {
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
  }, [id, token])

  const handleJoin = async () => {
    if (!token || isJoining) return
    setIsJoining(true)
    try {
      const res = await apiClient.post(`/api/circles/${id}/request-join/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      await fetchCircle()

      let successMsg = 'Join request sent successfully! ⏳'
      if (res.data.status === 'joined' || res.data.status === 'already_member') {
        successMsg = res.data.message || 'Joined successfully! 🎯'
      }

      toast.success(successMsg, {
        style: {
          background: '#F5F5F5',
          color: '#4A465F',
          border: '1px solid #6FB7B4',
          fontWeight: 'bold',
        }
      })
    } catch (error: any) {
      console.error('FULL ERROR:', error)
      console.error('RESPONSE:', error.response)
      console.error('DATA:', error.response?.data)

      const message = error.response?.data?.error || 'Failed to send join request.'

      toast.error(message, {
        style: {
          background: '#F5F5F5',
          color: '#F43F5E',
          border: '1px solid #F43F5E',
          fontWeight: 'bold',
        }
      })
    } finally {
      setIsJoining(false)
    }
  }


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] text-[#4A465F]/40">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold">Loading Study Circle...</p>
      </div>
    )
  }

  if (!circle) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[#4A465F]">Circle not found</h2>
        <button 
          onClick={() => router.push('/study-circles')}
          className="mt-4 text-[#5EC2B7] font-bold"
        >
          Go back to listing
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'resources', label: 'Resource Vault', icon: FileText },
    { id: 'members', label: 'Members', icon: Users },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/study-circles')}
          className="flex items-center gap-2 text-[#4A465F]/40 hover:text-[#4A465F] font-bold transition-colors mb-4 group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Circles
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#5EC2B7]/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-xl bg-[#5EC2B7]/10 text-[#5EC2B7] text-[10px] font-black uppercase tracking-widest">
                {circle.subject || 'Study Circle'}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">
                <Users className="w-3.5 h-3.5" />
                {circle.member_count} Members
              </span>
            </div>
            <h1 className="text-4xl font-black text-[#4A465F] tracking-tight mb-2">{circle.name}</h1>
            <p className="text-[#4A465F]/60 font-medium max-w-2xl">{circle.description}</p>
          </div>

          {!circle.is_member && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoin}
              disabled={isJoining}
              className="px-8 py-4 bg-[#5EC2B7] text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-[#5EC2B7]/20 relative z-10"
            >
              {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
              Join this Circle
            </motion.button>
          )}
        </div>
      </div>

      {!circle.is_member ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-[#4A465F]/5 shadow-sm">
          <div className="w-24 h-24 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-[#4A465F]/20" />
          </div>
          <h3 className="text-2xl font-bold text-[#4A465F] mb-3">Member Exclusive Content</h3>
          <p className="text-[#4A465F]/40 font-medium mb-8 max-w-md mx-auto">
            You need to be a member of this study circle to participate in discussions and access resources.
          </p>
          <button 
            onClick={handleJoin}
            disabled={isJoining}
            className="px-10 py-4 bg-[#4A465F] text-white rounded-2xl font-bold hover:bg-[#4A465F]/90 transition-all flex items-center gap-2 mx-auto"
          >
            {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Now to Unlock'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#4A465F]/5 shadow-sm w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    isActive 
                      ? 'bg-[#4A465F] text-white shadow-lg shadow-[#4A465F]/20' 
                      : 'text-[#4A465F]/40 hover:text-[#4A465F] hover:bg-[#F5F5F5]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm overflow-hidden min-h-[500px]"
          >
            {activeTab === 'discussion' && <Discussion circleId={id} />}
            {activeTab === 'resources' && <ResourceVault circleId={id} />}
            {activeTab === 'members' && <MembersList circleId={id} />}
          </motion.div>
        </div>
      )}
    </div>
  )
}
