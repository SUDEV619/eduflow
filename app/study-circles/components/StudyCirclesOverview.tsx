
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Users, Activity, Plus, Search, Loader2, Clock, AlertCircle, CheckCircle, Folder } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

interface StudyCircle {
  id: number
  name: string
  description: string
  subject: string
  member_count: number
  is_member: boolean
  is_admin: boolean
  is_private: boolean
  request_status: 'pending' | 'approved' | 'rejected' | null
}

interface StudyCirclesOverviewProps {
  onCircleSelect: (id: number) => void;
  onCreateClick: () => void;
  onJoinClick: () => void;
}

type CategoryTab = 'my' | 'joined' | 'all'

export default function StudyCirclesOverview({ 
  onCircleSelect, 
  onCreateClick, 
  onJoinClick 
}: StudyCirclesOverviewProps) {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<CategoryTab>('all')
  const [data, setData] = useState<{
    my_circles: StudyCircle[],
    joined_circles: StudyCircle[],
    all_circles: StudyCircle[]
  }>({
    my_circles: [],
    joined_circles: [],
    all_circles: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [requestingId, setRequestingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCircles = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const params = searchTerm ? `?search=${searchTerm}` : ''
      const res = await apiClient.get(`/api/circles/${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setData(res.data)
    } catch (error) {
      console.error('Failed to fetch circles:', error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCircles()
  }, [token, searchTerm])

  const handleRequestJoin = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token) return
    setRequestingId(id)
    try {
      const res = await apiClient.post(`/api/circles/${id}/request-join/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.data.status === 'joined' || res.data.status === 'already_member' || res.data.status === 'member') {
        toast.success(res.data.message || 'Joined successfully! 🎯')
        // Direct join success or already member
        fetchCircles(true)
      } else {
        toast.success('Join request sent! ⏳')
        // Request sent
        setData(prev => ({
          ...prev,
          all_circles: prev.all_circles.map(c => c.id === id ? { ...c, request_status: 'pending' } : c)
        }))
      }
    } catch (error: any) {
      console.error('FULL ERROR:', error)
      console.error('RESPONSE:', error.response)
      console.error('DATA:', error.response?.data)
      const message = error.response?.data?.error || 'Failed to send join request.'
      toast.error(message)
    } finally {
      setRequestingId(null)
    }
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const tabs = [
    { id: 'my', label: 'My Study Circles', count: data.my_circles.length },
    { id: 'joined', label: 'Joined Circles', count: data.joined_circles.length },
    { id: 'all', label: 'All Circles', count: data.all_circles.length },
  ]

  const currentCircles = activeTab === 'my' ? data.my_circles : 
                         activeTab === 'joined' ? data.joined_circles : 
                         data.all_circles

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#4A465F] tracking-tight">
            Study Circles
          </h1>
          <p className="mt-2 text-[#2E2E2E]/60 font-medium max-w-xl">
            Collaborate, share resources, and excel together in specialized study groups.
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateClick}
          className="px-8 py-4 bg-[#5EC2B7] text-white rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-[#5EC2B7]/20 transition-all"
        >
          <Plus className="w-6 h-6" />
          Create New Circle
        </motion.button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 rounded-[2rem] border border-[#4A465F]/5 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CategoryTab)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#4A465F] text-white shadow-lg shadow-[#4A465F]/20' 
                  : 'text-[#4A465F]/40 hover:text-[#4A465F] hover:bg-[#F5F5F5]'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-lg text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#4A465F]/5 text-[#4A465F]/40'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/30" />
          <input 
            type="text" 
            placeholder="Search by name or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-medium text-[#4A465F] transition-all"
          />
        </div>
      </div>

      {/* Grid of Circles */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-[#4A465F]/20">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-bold">Gathering Study Circles...</p>
        </div>
      ) : currentCircles.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border border-[#4A465F]/5 shadow-sm">
          <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
            <Folder className="w-10 h-10 text-[#4A465F]/10" />
          </div>
          <h3 className="text-xl font-bold text-[#4A465F] mb-2">No circles found here</h3>
          <p className="text-[#4A465F]/40 font-medium max-w-xs mx-auto mb-8">
            {activeTab === 'my' ? "You haven't created any circles yet. Start your own community today!" : 
             activeTab === 'joined' ? "You haven't joined any circles yet. Explore and find your tribe!" : 
             "We couldn't find any circles matching your criteria."}
          </p>
          {activeTab === 'my' && (
            <button onClick={onCreateClick} className="text-[#5EC2B7] font-black uppercase tracking-widest text-xs hover:underline">
              Create My First Circle
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {currentCircles.map((circle) => (
              <motion.div
                key={circle.id}
                layout
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                onClick={() => circle.is_member && onCircleSelect(circle.id)}
                className={`bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#4A465F]/5 relative overflow-hidden group flex flex-col h-full transition-all ${
                  !circle.is_member ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl hover:shadow-[#4A465F]/5'
                }`}
              >
                {/* Glow Effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5EC2B7]/10 to-transparent blur-2xl -mr-16 -mt-16 group-hover:from-[#5EC2B7]/20 transition-all duration-500" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                      <span className="px-3 py-1 rounded-lg bg-[#5EC2B7]/10 text-[#5EC2B7] text-[10px] font-black uppercase tracking-widest w-fit">
                        {circle.subject || 'General'}
                      </span>
                      {circle.is_admin && (
                        <span className="px-2 py-0.5 text-[#4A465F]/40 text-[9px] font-bold uppercase tracking-tighter">
                          Created by You
                        </span>
                      )}
                    </div>
                    
                    {circle.is_member ? (
                      <div className="bg-green-100 text-green-700 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" />
                        Member
                      </div>
                    ) : circle.request_status === 'pending' ? (
                      <div className="bg-amber-100 text-amber-700 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Pending
                      </div>
                    ) : circle.request_status === 'rejected' ? (
                      <div className="bg-rose-100 text-rose-700 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />
                        Rejected
                      </div>
                    ) : null}
                  </div>

                  <h3 className="text-2xl font-black text-[#4A465F] mb-3 group-hover:text-[#5EC2B7] transition-colors line-clamp-1">
                    {circle.name}
                  </h3>
                  
                  <p className="text-[#2E2E2E]/50 font-medium line-clamp-3 text-sm mb-8 flex-grow">
                    {circle.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-[#4A465F]/5">
                    <div className="flex items-center gap-2 text-[#4A465F]/40 text-sm font-bold">
                      <Users className="w-4 h-4 text-[#5EC2B7]" />
                      {circle.member_count} <span className="font-medium">Members</span>
                    </div>
                    
                    {!circle.is_member && (
                      <div onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={(e) => handleRequestJoin(circle.id, e)}
                          disabled={requestingId === circle.id || circle.request_status === 'pending'}
                          className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                            circle.request_status === 'rejected' 
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                              : 'bg-[#F5F5F5] text-[#4A465F] hover:bg-[#5EC2B7] hover:text-white'
                          } disabled:opacity-50`}
                        >
                          {requestingId === circle.id ? 'Sending...' : 
                           circle.request_status === 'rejected' ? 'Request Again' : (circle.is_private ? 'Request to Join' : 'Join Circle')}
                        </button>
                      </div>
                    )}

                    {circle.is_member && (
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#4A465F] group-hover:text-white transition-all">
                        <Plus className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
