
'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Search, Filter, X, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

interface CreateJoinSectionProps {
  mode: 'create' | 'join';
  onBack: () => void;
  onCircleSelect?: (id: number) => void;
}

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

export default function CreateJoinSection({ mode, onBack, onCircleSelect }: CreateJoinSectionProps) {
  const { token } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [circles, setCircles] = useState<StudyCircle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [requestingId, setRequestingId] = useState<number | null>(null)

  const fetchCircles = async () => {
    if (mode !== 'join') return
    setIsLoading(true)
    try {
      const params = searchTerm ? `?search=${searchTerm}` : ''
      const res = await apiClient.get(`/api/circles/${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setCircles(res.data)
    } catch (error) {
      console.error('Failed to fetch circles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCircles()
  }, [mode, searchTerm, token])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || isSubmitting) return
    setIsSubmitting(true)
    try {
      const res = await apiClient.post('/api/circles/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Study circle created successfully! 🎯')
      if (onCircleSelect) {
        onCircleSelect(res.data.id)
      } else {
        onBack()
      }
    } catch (error: any) {
      console.error('Failed to create circle:', error)
      const message = error.response?.data?.error || 'Failed to create circle. Please try again.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRequestJoin = async (id: number) => {
    if (!token) return
    setRequestingId(id)
    try {
      const res = await apiClient.post(`/api/circles/${id}/request-join/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.data.status === 'joined' || res.data.status === 'already_member') {
        toast.success(res.data.message || 'Joined successfully! 🎯')
        // Update local state to show as member
        setCircles(prev => prev.map(c => c.id === id ? { 
          ...c, 
          is_member: true, 
          member_count: c.member_count + (res.data.status === 'joined' ? 1 : 0)
        } : c))
      } else {
        toast.success('Join request sent! ⏳')
        // Update local state to show pending
        setCircles(prev => prev.map(c => c.id === id ? { ...c, request_status: 'pending' } : c))
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

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -5 }}
        onClick={onBack}
        className="flex items-center gap-2 text-[#4A465F]/60 font-semibold transition-colors hover:text-[#4A465F]"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Overview
      </motion.button>

      {mode === 'create' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#4A465F]/5 relative overflow-hidden"
        >
          <div className="absolute top-[-10%] right-[-10%] w-[200px] h-[200px] rounded-full blur-[60px] bg-[#6FB7B4]/5" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[180px] h-[180px] rounded-full blur-[50px] bg-[#5EC2B7]/5" />

          <div className="relative z-10 space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-[#4A465F] tracking-tight">
                Create a New Circle
              </h2>
              <p className="text-[#2E2E2E]/60 text-lg">
                Build a community around your study goals and grow together.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[#4A465F] uppercase tracking-widest pl-2">
                    Circle Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter a catchy name..."
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F5F5] border-2 border-transparent focus:border-[#6FB7B4] focus:ring-4 focus:ring-[#6FB7B4]/10 transition-all outline-none text-[#4A465F] font-medium"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-[#4A465F] uppercase tracking-widest pl-2">
                    Subject / Category
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g. Physics, JEE, UPSC..."
                    className="w-full px-6 py-4 rounded-2xl bg-[#F5F5F5] border-2 border-transparent focus:border-[#6FB7B4] focus:ring-4 focus:ring-[#6FB7B4]/10 transition-all outline-none text-[#4A465F] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-[#4A465F] uppercase tracking-widest pl-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this circle all about?"
                  className="w-full px-6 py-4 rounded-2xl bg-[#F5F5F5] border-2 border-transparent focus:border-[#6FB7B4] focus:ring-4 focus:ring-[#6FB7B4]/10 transition-all outline-none text-[#4A465F] font-medium resize-none shadow-inner"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-[#5EC2B7] text-white text-lg font-bold shadow-lg shadow-[#5EC2B7]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Plus className="w-6 h-6" />}
                {isSubmitting ? 'Launching...' : 'Launch Circle'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold text-[#4A465F] tracking-tight">
              Join a Circle
            </h2>
            <p className="text-[#2E2E2E]/60 text-lg">
              Explore communities and find your tribe.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors group-focus-within:text-[#6FB7B4]">
              <Search className="w-6 h-6 text-[#4A465F]/30" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name or subject..."
              className="w-full pl-16 pr-6 py-6 rounded-[2rem] bg-white shadow-sm border border-[#4A465F]/5 group-focus-within:border-[#6FB7B4] group-focus-within:ring-8 group-focus-within:ring-[#6FB7B4]/5 transition-all outline-none text-[#4A465F] text-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h3 className="text-xl font-bold text-[#4A465F] col-span-full mb-2 flex items-center gap-3">
              Available Circles
              <div className="h-[2px] w-20 bg-[#6FB7B4]/30 rounded-full" />
            </h3>
            
            {isLoading ? (
              <div className="col-span-full py-20 flex justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#4A465F]/20" />
              </div>
            ) : circles.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-[#4A465F]/5">
                <p className="font-bold text-[#4A465F]/40">No circles found matching your search.</p>
              </div>
            ) : (
              circles.map((circle) => (
                <motion.div
                  key={circle.id}
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  className="bg-white rounded-3xl p-6 flex items-center gap-6 shadow-sm border border-[#4A465F]/5 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6FB7B4] to-[#A8DAD6] flex items-center justify-center text-white text-2xl font-black shrink-0">
                    {circle.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-[#4A465F] group-hover:text-[#6FB7B4] transition-colors line-clamp-1">
                      {circle.name}
                    </h4>
                    <p className="text-xs font-black text-[#5EC2B7] uppercase tracking-widest mb-1">{circle.subject}</p>
                    <p className="text-sm text-[#2E2E2E]/50 font-medium">{circle.member_count} Members</p>
                  </div>
                  
                  {circle.is_member ? (
                    <button 
                      onClick={() => onCircleSelect?.(circle.id)}
                      className="px-5 py-2 rounded-xl bg-[#5EC2B7]/10 text-[#5EC2B7] font-black text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Entered
                    </button>
                  ) : circle.request_status === 'pending' ? (
                    <div className="px-5 py-2 rounded-xl bg-amber-50 text-amber-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-amber-100">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </div>
                  ) : circle.request_status === 'rejected' ? (
                    <button 
                      onClick={() => handleRequestJoin(circle.id)}
                      disabled={requestingId === circle.id}
                      className="px-5 py-2 rounded-xl bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-rose-100"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      {requestingId === circle.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Re-request'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleRequestJoin(circle.id)}
                      disabled={requestingId === circle.id}
                      className="px-5 py-2 rounded-xl bg-[#F5F5F5] text-[#4A465F] font-bold text-sm hover:bg-[#6FB7B4] hover:text-white transition-all disabled:opacity-50"
                    >
                      {requestingId === circle.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (circle.is_private ? 'Request to Join' : 'Join Circle')}
                    </button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
