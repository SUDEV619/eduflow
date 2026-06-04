
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Send, Users, Globe, Smartphone, 
  Search, Plus, Trash2, CheckCircle, Clock, 
  AlertCircle, ArrowRight, MoreVertical, Eye,
  RefreshCw, Filter, Calendar, Mail, Info, Loader2
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

interface Broadcast {
  id: number;
  title: string;
  message: string;
  is_global: boolean;
  created_at: string;
  scheduled_at: string | null;
  is_sent: boolean;
  delivered_count: number;
  read_count: number;
  created_by_name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function NotificationManagement() {
  const { token } = useAuth()
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [isGlobal, setIsGlobal] = useState(true)
  const [scheduledAt, setScheduledAt] = useState('')
  const [targetEmails, setTargetEmails] = useState('') // Comma separated for simplicity
  const [sendNow, setSendNow] = useState(true)

  const fetchBroadcasts = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/api/notifications/admin/notifications/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBroadcasts(res.data.data)
    } catch (error) {
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchBroadcasts()
  }, [token])

  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) return toast.error('Please fill required fields')

    setIsSending(true)
    try {
      let user_ids: number[] = []
      if (!isGlobal && targetEmails) {
        // Find users by email - in a real app, this would be a search/select UI
        // For now, we'll assume a search endpoint or just pass emails if the backend supports it
        // Since our backend expects IDs, we'll try to fetch users first
        const emails = targetEmails.split(',').map(e => e.trim())
        const userRes = await apiClient.get('/api/admin/users/', {
           params: { search: emails[0] }, // Simplified: just taking first for demonstration or backend should handle multiple
           headers: { Authorization: `Bearer ${token}` }
        })
        user_ids = userRes.data.data.filter((u: User) => emails.includes(u.email)).map((u: User) => u.id)
      }

      await apiClient.post('/api/notifications/admin/notifications/', {
        title,
        message,
        is_global: isGlobal,
        scheduled_at: scheduledAt || null,
        send_now: sendNow,
        user_ids
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      toast.success('Broadcast created successfully')
      setIsModalOpen(false)
      fetchBroadcasts()
      // Reset form
      setTitle('')
      setMessage('')
      setIsGlobal(true)
      setScheduledAt('')
      setTargetEmails('')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create broadcast')
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this broadcast? Historical data will be lost.')) return
    try {
      await apiClient.delete(`/api/notifications/admin/notifications/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Deleted')
      setBroadcasts(broadcasts.filter(b => b.id !== id))
    } catch (error) {
      toast.error('Failed to delete')
    }
  }

  const handleManualSend = async (id: number) => {
    try {
      await apiClient.post(`/api/notifications/admin/notifications/${id}/send/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Dispatch started')
      fetchBroadcasts()
    } catch (error) {
      toast.error('Failed to send')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#4A465F] tracking-tight">Notification <span className="text-[#6FB7B4]">Control</span></h1>
          <p className="text-sm font-bold text-[#4A465F]/40 uppercase tracking-widest mt-1">Manage broadcasts & system alerts</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-[#4A465F] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#4A465F]/20 hover:bg-[#6FB7B4] hover:scale-105 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Broadcast
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Total Sent', value: broadcasts.filter(b => b.is_sent).length, icon: CheckCircle, color: '#6FB7B4' },
           { label: 'Scheduled', value: broadcasts.filter(b => !b.is_sent && b.scheduled_at).length, icon: Clock, color: '#4A465F' },
           { label: 'Read Rate', value: broadcasts.length > 0 ? `${Math.round((broadcasts.reduce((acc, b) => acc + b.read_count, 0) / (broadcasts.reduce((acc, b) => acc + b.delivered_count, 0) || 1)) * 100)}%` : '0%', icon: Eye, color: '#A8DAD6' },
         ].map((stat, idx) => (
           <div key={idx} className="bg-white rounded-[2rem] p-8 border border-[#4A465F]/5 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black uppercase text-[#4A465F]/30 tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-[#2E2E2E]">{stat.value}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F5F5F5]">
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
           </div>
         ))}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-[3rem] border border-[#4A465F]/5 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-[#4A465F]/5 flex items-center justify-between bg-[#F5F5F5]/30">
           <h3 className="text-xl font-black text-[#4A465F] uppercase tracking-tighter flex items-center gap-3">
              <RefreshCw className={`w-5 h-5 text-[#6FB7B4] ${isLoading ? 'animate-spin' : ''}`} onClick={fetchBroadcasts} />
              Broadcast History
           </h3>
           <div className="flex gap-2">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/30" />
                <input type="text" placeholder="Search alerts..." className="bg-white rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold border border-[#4A465F]/10 focus:outline-none focus:ring-2 ring-[#6FB7B4]/20 w-64" />
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest border-b border-[#4A465F]/5">
                <th className="px-8 py-6">Notification</th>
                <th className="px-8 py-6 text-center">Type</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-center">Engagement</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && broadcasts.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[#6FB7B4] opacity-20" /></td></tr>
              ) : broadcasts.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-[#4A465F]/20 font-bold">No broadcasts found</td></tr>
              ) : broadcasts.map((b) => (
                <tr key={b.id} className="group hover:bg-[#F5F5F5]/50 transition-all border-b border-[#4A465F]/5 last:border-0">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${b.is_sent ? 'bg-[#6FB7B4] shadow-[#6FB7B4]/20' : 'bg-amber-400 shadow-amber-400/20'}`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-[#2E2E2E]">{b.title}</p>
                        <p className="text-[10px] font-bold text-[#4A465F]/30 uppercase tracking-widest line-clamp-1 max-w-[300px]">{b.message}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${b.is_global ? 'bg-[#A8DAD6]/10 text-[#4A465F]' : 'bg-[#6FB7B4]/10 text-[#6FB7B4]'}`}>
                      {b.is_global ? 'Global' : 'Targeted'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      b.is_sent ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {b.is_sent ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {b.is_sent ? 'Delivered' : b.scheduled_at ? 'Scheduled' : 'Draft'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                       <span className="text-xs font-black text-[#4A465F]">{b.read_count} / {b.delivered_count}</span>
                       <div className="w-16 h-1 bg-[#F5F5F5] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#6FB7B4]" 
                            style={{ width: `${(b.read_count / (b.delivered_count || 1)) * 100}%` }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                       {!b.is_sent && (
                         <button 
                           onClick={() => handleManualSend(b.id)}
                           className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                           title="Send Now"
                         >
                           <Send className="w-4 h-4" />
                         </button>
                       )}
                       <button 
                         onClick={() => handleDelete(b.id)}
                         className="p-2.5 bg-[#FF4D4F]/10 text-[#FF4D4F] hover:bg-[#FF4D4F]/20 rounded-xl transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSending && setIsModalOpen(false)}
              className="absolute inset-0 bg-[#4A465F]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 space-y-8">
                 <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-[#4A465F] tracking-tight">Create <span className="text-[#6FB7B4]">Broadcast</span></h2>
                      <p className="text-xs font-bold text-[#4A465F]/40 uppercase tracking-widest">New System Notification</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#6FB7B4]/10 flex items-center justify-center text-[#6FB7B4]">
                       <Bell className="w-6 h-6" />
                    </div>
                 </div>

                 <form onSubmit={handleCreateBroadcast} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Alert Title</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. System Maintenance Scheduled" 
                        className="w-full px-6 py-4 bg-[#F5F5F5] border-none rounded-2xl focus:ring-4 ring-[#6FB7B4]/10 font-bold outline-none" 
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Message Body</label>
                      <textarea 
                        rows={4} 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe the update or announcement..." 
                        className="w-full px-6 py-4 bg-[#F5F5F5] border-none rounded-2xl focus:ring-4 ring-[#6FB7B4]/10 font-bold outline-none resize-none" 
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Target Audience</label>
                          <div className="flex bg-[#F5F5F5] p-1.5 rounded-2xl">
                             <button 
                               type="button"
                               onClick={() => setIsGlobal(true)}
                               className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isGlobal ? 'bg-white text-[#4A465F] shadow-sm' : 'text-[#4A465F]/40'}`}
                             >
                               Global
                             </button>
                             <button 
                               type="button"
                               onClick={() => setIsGlobal(false)}
                               className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!isGlobal ? 'bg-white text-[#6FB7B4] shadow-sm' : 'text-[#4A465F]/40'}`}
                             >
                               Targeted
                             </button>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Schedule Dispatch</label>
                          <input 
                            type="datetime-local" 
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#F5F5F5] border-none rounded-xl focus:ring-4 ring-[#6FB7B4]/10 font-bold outline-none text-xs" 
                          />
                       </div>
                    </div>

                    {!isGlobal && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                         <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Target Emails (comma separated)</label>
                         <input 
                            type="text" 
                            value={targetEmails}
                            onChange={(e) => setTargetEmails(e.target.value)}
                            placeholder="user@example.com, another@user.com" 
                            className="w-full px-6 py-4 bg-[#F5F5F5] border-none rounded-2xl focus:ring-4 ring-[#6FB7B4]/10 font-bold outline-none" 
                         />
                      </motion.div>
                    )}

                    <div className="flex items-center gap-2 px-1">
                       <input 
                        type="checkbox" 
                        id="sendNow" 
                        checked={sendNow} 
                        onChange={(e) => setSendNow(e.target.checked)}
                        className="w-4 h-4 accent-[#6FB7B4]"
                       />
                       <label htmlFor="sendNow" className="text-xs font-bold text-[#4A465F]/60">Send immediately upon creation (if not scheduled)</label>
                    </div>

                    <div className="pt-4 flex gap-4">
                       <button 
                         type="button"
                         onClick={() => setIsModalOpen(false)}
                         className="flex-1 py-4 bg-[#F5F5F5] text-[#4A465F] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                       >
                         Cancel
                       </button>
                       <button 
                         type="submit"
                         disabled={isSending}
                         className="flex-[2] py-4 bg-[#4A465F] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#4A465F]/20 flex items-center justify-center gap-2 hover:bg-[#6FB7B4] transition-all disabled:opacity-50"
                       >
                         {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                         {scheduledAt ? 'Schedule Alert' : 'Dispatch Now'}
                       </button>
                    </div>
                 </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Section */}
      <div className="bg-[#4A465F] rounded-[4rem] p-12 text-white overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 transform group-hover:rotate-0 transition-transform duration-700">
            <Bell className="w-64 h-64" />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="space-y-6 flex-1 text-center md:text-left">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#6FB7B4] text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Info className="w-3 h-3" /> Pro Tip
               </div>
               <h2 className="text-4xl font-black tracking-tight leading-none uppercase italic">Reach your <span className="text-[#6FB7B4]">users</span> instantly</h2>
               <p className="text-lg font-bold opacity-60 leading-relaxed max-w-xl">Use broadcasts for critical system updates, new feature announcements, or platform-wide community events. Targeted alerts are perfect for specialized group mentoring sessions.</p>
            </div>
            
            <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#6FB7B4] flex items-center justify-center text-white shadow-lg">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black tracking-tight">Preview Notification</p>
                    <p className="text-[10px] font-bold opacity-40 uppercase">Your notification will look like this</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="h-4 w-3/4 bg-white/20 rounded-full" />
                  <div className="h-3 w-full bg-white/10 rounded-full" />
                  <div className="h-3 w-5/6 bg-white/10 rounded-full" />
               </div>
               <div className="pt-4 flex justify-end">
                  <div className="px-6 py-2 bg-[#6FB7B4] rounded-xl text-[10px] font-black uppercase tracking-widest">View Details</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
