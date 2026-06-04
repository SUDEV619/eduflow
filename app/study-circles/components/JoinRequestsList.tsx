
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Loader2, User, Clock, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'

interface JoinRequest {
  id: number
  user_name: string
  user_email: string
  created_at: string
  status: string
}

interface JoinRequestsListProps {
  circleId: string;
  onActionComplete?: () => void;
}

export default function JoinRequestsList({ circleId, onActionComplete }: JoinRequestsListProps) {
  const { token } = useAuth()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)

  const fetchRequests = async () => {
    if (!token) return
    try {
      const res = await apiClient.get(`/api/circles/${circleId}/join-requests/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRequests(res.data)
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [circleId, token])

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    if (!token) return
    setProcessingId(requestId)
    try {
      await apiClient.post(`/api/circles/join-requests/${requestId}/${action}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setRequests(prev => prev.filter(r => r.id !== requestId))
      
      // Trigger parent refresh to update member count etc
      if (onActionComplete) {
        onActionComplete()
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error)
      alert(`Failed to ${action} request.`)
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-[#4A465F]/20">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-bold">Loading requests...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[#4A465F]">Pending Requests</h3>
        <p className="text-sm text-[#4A465F]/40 font-medium">Review and manage join requests for your circle</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-[#F5F5F5]/50 border-2 border-dashed border-[#4A465F]/5 rounded-3xl p-20 text-center">
            <CheckCircle2 className="w-12 h-12 text-[#5EC2B7]/20 mx-auto mb-4" />
            <p className="font-bold text-[#4A465F]/40">All caught up! No pending requests.</p>
          </div>
        ) : (
          <AnimatePresence>
            {requests.map((req, idx) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-[#4A465F]/5 shadow-sm flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5F5F5] flex items-center justify-center group-hover:bg-[#5EC2B7]/10 transition-colors">
                    <User className="w-6 h-6 text-[#4A465F]/20 group-hover:text-[#5EC2B7]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-[#4A465F]">{req.user_name}</h4>
                    <p className="text-sm text-[#4A465F]/40 font-medium">{req.user_email}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">
                      <Clock className="w-3 h-3" />
                      Requested {new Date(req.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={processingId === req.id}
                    className="p-4 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    title="Reject"
                  >
                    {processingId === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <X className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={processingId === req.id}
                    className="p-4 rounded-2xl bg-[#5EC2B7] text-white hover:bg-[#4DB0A6] shadow-lg shadow-[#5EC2B7]/20 transition-all flex items-center gap-2"
                    title="Approve"
                  >
                    {processingId === req.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    <span className="font-bold text-sm pr-1">Approve</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
