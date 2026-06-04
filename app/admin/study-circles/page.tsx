
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Flag, Search, Filter, ShieldAlert, CheckCircle, 
  XCircle, Trash2, Eye, Loader2, MoreVertical, 
  ArrowRight, Shield, Globe, Lock, AlertCircle, Info, Calendar, Mail
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

interface CircleListItem {
  id: number;
  name: string;
  creator: string;
  creator_email: string;
  members: number;
  members_count: number;
  status: string;
  is_active: boolean;
  reports: number;
  reports_count: number;
  created_at: string;
}

interface CircleDetails {
  id: number;
  name: string;
  description: string;
  subject: string;
  creator: { name: string; email: string };
  is_active: boolean;
  is_private: boolean;
  created_at: string;
  members: Array<{ id: number; name: string; email: string }>;
  reports: Array<{ id: number; reporter: number; reporter_name: string; message: string; created_at: string }>;
}

export default function AdminStudyCirclesPage() {
  const { token } = useAuth()
  const [circles, setCircles] = useState<CircleListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all')
  const [selectedCircle, setSelectedCircle] = useState<CircleDetails | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null)

  const fetchCircles = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/api/admin/circles/', {
        params: { search, status: statusFilter, sort_reports: 'true' },
        headers: { Authorization: `Bearer ${token}` }
      })
      setCircles(res.data.data)
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error.message;
      toast.error(`Failed to load study circles: ${msg}`);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchCircles()
  }, [token, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCircles()
  }

  const viewDetails = async (id: number) => {
    setIsDetailsLoading(true)
    try {
      const res = await apiClient.get(`/api/admin/circles/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedCircle(res.data.data)
    } catch (error) {
      toast.error('Failed to load details')
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const toggleStatus = async (circle: CircleListItem) => {
    setIsActionLoading(circle.id)
    try {
      const res = await apiClient.patch(`/api/admin/circles/${circle.id}/`, 
        { is_active: !circle.is_active },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(res.data.message)
      setCircles(circles.map(c => c.id === circle.id ? { ...c, is_active: res.data.is_active, status: res.data.is_active ? 'Active' : 'Disabled' } : c))
      if (selectedCircle?.id === circle.id) {
        setSelectedCircle({ ...selectedCircle, is_active: res.data.is_active })
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setIsActionLoading(null)
    }
  }

  const deleteCircle = async (id: number) => {
    if (!window.confirm('CRITICAL: Permanently delete this study circle? This cannot be undone.')) return
    
    setIsActionLoading(id)
    try {
      await apiClient.delete(`/api/admin/circles/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Circle deleted successfully')
      setCircles(circles.filter(c => c.id !== id))
      setSelectedCircle(null)
    } catch (error) {
      toast.error('Failed to delete circle')
    } finally {
      setIsActionLoading(null)
    }
  }

  return (
    <div className="space-y-8 bg-[#F5F5F5] min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#4A465F] tracking-tight">Study Circles <span className="text-[#6FB7B4]">Management</span></h1>
          <p className="text-sm font-bold text-[#4A465F]/40 uppercase tracking-widest mt-1">Moderation & Quality Control</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex bg-white/50 p-1.5 rounded-2xl border border-[#4A465F]/10">
              {(['all', 'active', 'disabled'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    statusFilter === s ? 'bg-[#4A465F] text-white shadow-lg' : 'text-[#4A465F]/40 hover:text-[#4A465F]'
                  }`}
                >
                  {s}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A465F]/30 group-focus-within:text-[#6FB7B4] transition-colors" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by circle name or creator..."
          className="w-full bg-white border border-[#4A465F]/10 rounded-3xl py-5 pl-14 pr-32 focus:outline-none focus:ring-4 ring-[#6FB7B4]/10 font-bold text-[#2E2E2E] placeholder:text-[#4A465F]/20 transition-all"
        />
        <button 
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#4A465F] text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#6FB7B4] transition-all"
        >
          Search
        </button>
      </form>

      {/* Circles Grid/Table */}
      <div className="bg-white rounded-[2.5rem] border border-[#4A465F]/5 shadow-2xl shadow-[#4A465F]/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#4A465F]/5">
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Circle</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Creator</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest text-center">Members</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest text-center">Reports</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#6FB7B4] opacity-20" />
                  </td>
                </tr>
              ) : circles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-[#4A465F]/20">
                    <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="font-bold">No study circles found</p>
                  </td>
                </tr>
              ) : circles.map((circle) => (
                <tr key={circle.id} className={`group hover:bg-[#F5F5F5]/50 transition-all border-b border-[#4A465F]/5 last:border-0 ${circle.reports >= 5 ? 'bg-[#FF4D4F]/5' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg ${circle.reports >= 5 ? 'bg-[#FF4D4F] shadow-[#FF4D4F]/20' : 'bg-gradient-to-br from-[#6FB7B4] to-[#A8DAD6] shadow-[#6FB7B4]/20'}`}>
                        {circle.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-[#2E2E2E]">{circle.name}</p>
                        <p className="text-[10px] font-bold text-[#4A465F]/30 uppercase tracking-widest">{new Date(circle.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="font-bold text-[#2E2E2E]">{circle.creator}</p>
                      <p className="text-[10px] font-medium text-[#4A465F]/40">{circle.creator_email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-4 py-1.5 bg-[#4A465F]/5 rounded-full text-xs font-black text-[#4A465F]">
                      {circle.members}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black ${
                      circle.reports >= 5 ? 'bg-[#FF4D4F] text-white shadow-lg shadow-[#FF4D4F]/20' : 
                      circle.reports > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      <Flag className="w-3 h-3" />
                      {circle.reports}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      circle.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#FF4D4F]/10 text-[#FF4D4F]'
                    }`}>
                      {circle.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {circle.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => viewDetails(circle.id)}
                        className="p-2.5 bg-white text-[#4A465F]/40 hover:text-[#4A465F] hover:shadow-md rounded-xl transition-all border border-[#4A465F]/5"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleStatus(circle)}
                        disabled={isActionLoading === circle.id}
                        className={`p-2.5 rounded-xl transition-all ${
                          circle.is_active 
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {isActionLoading === circle.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => deleteCircle(circle.id)}
                        disabled={isActionLoading === circle.id}
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

      {/* Details Panel / Modal */}
      <AnimatePresence>
        {selectedCircle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCircle(null)}
              className="absolute inset-0 bg-[#4A465F]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#F5F5F5] w-full max-w-5xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Sidebar Info */}
              <div className="w-full md:w-80 bg-white border-r border-[#4A465F]/5 p-8 overflow-y-auto">
                <div className="space-y-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-[#6FB7B4] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-[#6FB7B4]/20">
                      {selectedCircle.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-[#4A465F] leading-tight">{selectedCircle.name}</h2>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6FB7B4]">
                        ID: #{selectedCircle.id}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t border-[#4A465F]/5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#F5F5F5] rounded-2xl text-[#4A465F]/40"><Info className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#4A465F]/30 tracking-widest mb-1">Subject</p>
                        <p className="font-bold text-[#2E2E2E]">{selectedCircle.subject || 'General'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#F5F5F5] rounded-2xl text-[#4A465F]/40"><Calendar className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#4A465F]/30 tracking-widest mb-1">Created</p>
                        <p className="font-bold text-[#2E2E2E]">{new Date(selectedCircle.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-[#F5F5F5] rounded-2xl text-[#4A465F]/40"><Shield className="w-4 h-4" /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-[#4A465F]/30 tracking-widest mb-1">Privacy</p>
                        <div className="flex items-center gap-1.5 font-bold text-[#2E2E2E]">
                          {selectedCircle.is_private ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                          {selectedCircle.is_private ? 'Private Circle' : 'Public Circle'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#4A465F] rounded-[2.5rem] text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Creator Info</p>
                    <p className="font-black text-lg">{selectedCircle.creator.name}</p>
                    <p className="text-xs font-medium opacity-60 flex items-center gap-2 mt-1 truncate">
                      <Mail className="w-3 h-3" />
                      {selectedCircle.creator.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Details Area */}
              <div className="flex-1 overflow-y-auto bg-white p-10 space-y-12">
                 <div className="space-y-4">
                    <h3 className="text-xl font-black text-[#4A465F] uppercase tracking-tighter flex items-center gap-3">
                      About Circle
                    </h3>
                    <p className="text-[#2E2E2E]/80 font-bold leading-relaxed bg-[#F5F5F5] p-8 rounded-[2rem]">
                      {selectedCircle.description || 'No description provided.'}
                    </p>
                 </div>

                 {/* Reports Section */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-[#4A465F] uppercase tracking-tighter flex items-center gap-3">
                        Moderation Reports 
                        <span className={`text-xs px-3 py-1 rounded-full ${selectedCircle.reports.length >= 5 ? 'bg-[#FF4D4F] text-white' : 'bg-amber-100 text-amber-600'}`}>
                          {selectedCircle.reports.length}
                        </span>
                       </h3>
                    </div>
                    
                    {selectedCircle.reports.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-[#4A465F]/5 rounded-[2rem] text-center text-[#4A465F]/20">
                        <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-10" />
                        <p className="font-bold">This circle has a clean record</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedCircle.reports.map((report) => (
                          <div key={report.id} className="p-6 bg-[#FF4D4F]/5 rounded-3xl border border-[#FF4D4F]/10 flex items-start gap-4">
                             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#FF4D4F] shadow-sm">
                               <Flag className="w-5 h-5" />
                             </div>
                             <div className="flex-1">
                               <div className="flex items-center justify-between mb-2">
                                 <p className="font-black text-[#2E2E2E]">{report.reporter_name || `User #${report.reporter}`}</p>
                                 <p className="text-[10px] font-bold text-[#4A465F]/40 uppercase">{new Date(report.created_at).toLocaleString()}</p>
                               </div>
                               <p className="text-sm font-bold text-[#2E2E2E]/70 leading-relaxed italic">"{report.message}"</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 {/* Action Footer */}
                 <div className="pt-8 border-t border-[#4A465F]/5 flex items-center justify-between gap-4">
                    <div className="flex gap-4">
                      <button 
                        onClick={() => toggleStatus(circles.find(c => c.id === selectedCircle.id)!)}
                        className={`px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all ${
                          selectedCircle.is_active 
                            ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' 
                            : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20'
                        }`}
                      >
                        <Shield className="w-5 h-5" />
                        {selectedCircle.is_active ? 'Disable Circle' : 'Enable Circle'}
                      </button>
                      
                      <button 
                        onClick={() => deleteCircle(selectedCircle.id)}
                        className="px-8 py-4 bg-[#FF4D4F] text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-[#FF4D4F]/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete Circle
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedCircle(null)}
                      className="px-8 py-4 bg-[#4A465F]/5 text-[#4A465F] rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-[#4A465F]/10 transition-all"
                    >
                      Close
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
