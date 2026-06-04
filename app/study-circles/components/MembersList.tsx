
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, User, Loader2, Mail, UserMinus, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'

interface Member {
  id: number
  name: string
  email: string
  is_admin: boolean
}

interface MembersListProps {
  circleId: string
  isAdmin: boolean
}

export default function MembersList({ circleId, isAdmin }: MembersListProps) {
  const { token } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRemoving, setIsRemoving] = useState<number | null>(null)

  const fetchMembers = useCallback(async () => {
    if (!token) return
    try {
      const res = await apiClient.get(`/api/circles/${circleId}/members/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMembers(res.data.data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setIsLoading(false)
    }
  }, [circleId, token])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleRemoveMember = async (userId: number, userName: string) => {
    if (!token || isRemoving) return
    if (!window.confirm(`Are you sure you want to remove ${userName} from this circle?`)) return

    setIsRemoving(userId)
    try {
      await apiClient.post(`/api/circles/${circleId}/remove-member/`, { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMembers(prev => prev.filter(m => m.id !== userId))
    } catch (error: any) {
      console.error('Failed to remove member:', error)
      alert(error.response?.data?.error || 'Failed to remove member')
    } finally {
      setIsRemoving(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-[#4A465F]/20">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-bold">Loading members...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-[#4A465F]">Circle Members</h3>
        <p className="text-sm text-[#4A465F]/40 font-medium">Connect with your study peers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member, idx) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col p-6 bg-[#F5F5F5]/30 rounded-3xl border border-[#4A465F]/5 hover:bg-white hover:shadow-xl transition-all group relative overflow-hidden"
          >
            {member.is_admin && (
              <div className="absolute top-0 right-0 p-3">
                <div className="bg-[#5EC2B7]/10 text-[#5EC2B7] p-1.5 rounded-lg" title="Circle Creator">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:bg-[#5EC2B7] group-hover:text-white transition-all">
                <User className="w-7 h-7 text-[#4A465F]/20 group-hover:text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#4A465F] truncate">{member.name}</h4>
                  {member.is_admin && (
                    <span className="text-[9px] font-black uppercase tracking-tighter text-[#5EC2B7] bg-[#5EC2B7]/10 px-1.5 py-0.5 rounded">Admin</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#4A465F]/40 uppercase tracking-widest truncate">
                  <Mail className="w-3 h-3" />
                  {member.email}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-[#4A465F]/5">
               <span className="text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">
                  Joined Recently
               </span>
               
               {isAdmin && !member.is_admin && (
                 <motion.button
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleRemoveMember(member.id, member.name)}
                   disabled={isRemoving === member.id}
                   className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                   title="Remove Member"
                 >
                   {isRemoving === member.id ? (
                     <Loader2 className="w-4 h-4 animate-spin" />
                   ) : (
                     <UserMinus className="w-4 h-4" />
                   )}
                 </motion.button>
               )}
            </div>
          </motion.div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-20 bg-[#F5F5F5]/50 rounded-3xl border-2 border-dashed border-[#4A465F]/5">
          <Users className="w-12 h-12 text-[#4A465F]/10 mx-auto mb-4" />
          <p className="font-bold text-[#4A465F]/40">No members found.</p>
        </div>
      )}
    </div>
  )
}
