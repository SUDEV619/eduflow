
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Settings, Users, UserCheck, Shield, Bell, 
  MessageSquare, Trash2, LogOut, Loader2, Save, 
  UserMinus, Check, AlertCircle, Globe, Lock, Flag, Send
} from 'lucide-react'
import { useState, useEffect } from 'react'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  circleId: number;
  isAdmin: boolean;
  onCircleUpdate: () => void;
  onLeaveOrDelete: () => void;
  token: string;
}

type Tab = 'general' | 'members' | 'requests' | 'permissions' | 'notifications' | 'report' | 'danger'

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  circleId, 
  isAdmin, 
  onCircleUpdate, 
  onLeaveOrDelete,
  token 
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [circleData, setCircleData] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])

  // Report states
  const [reportType, setReportType] = useState<'circle' | 'member'>('circle')
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [reportMessage, setReportMessage] = useState('')

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get(`/api/circles/${circleId}/settings/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCircleData(res.data)
      
      const membersRes = await apiClient.get(`/api/circles/${circleId}/members/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMembers(membersRes.data.data)

      if (isAdmin) {
        const requestsRes = await apiClient.get(`/api/circles/${circleId}/join-requests/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setRequests(requestsRes.data)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchSettings()
      setActiveTab(isAdmin ? 'general' : 'notifications')
    }
  }, [isOpen, circleId, isAdmin])

  const handleUpdateGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await apiClient.put(`/api/circles/${circleId}/settings/update/`, circleData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('General settings updated')
      onCircleUpdate()
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateNotifications = async (notifyData: any) => {
    setIsSaving(true)
    try {
      await apiClient.post(`/api/circles/${circleId}/settings/notifications/`, notifyData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCircleData({ ...circleData, user_settings: { ...circleData.user_settings, ...notifyData } })
      toast.success('Notification preferences saved')
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return
    try {
      await apiClient.post(`/api/circles/${circleId}/remove-member/`, { user_id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMembers(members.filter(m => m.id !== userId))
      toast.success('Member removed')
      onCircleUpdate()
    } catch (error) {
      toast.error('Failed to remove member')
    }
  }

  const handleRequestAction = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      const endpoint = action === 'approve' 
        ? `/api/circles/join-requests/${requestId}/approve/`
        : `/api/circles/join-requests-action/${requestId}/reject/`
      
      await apiClient.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setRequests(requests.filter(r => r.id !== requestId))
      toast.success(`Request ${action}d`)
      if (action === 'approve') {
        onCircleUpdate()
        const membersRes = await apiClient.get(`/api/circles/${circleId}/members/`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setMembers(membersRes.data.data)
      }
    } catch (error) {
      toast.error(`Failed to ${action} request`)
    }
  }

  const handleReport = async () => {
    if (isAdmin && reportType === 'circle') {
      toast.error('You cannot report your own circle')
      return
    }
    if (!reportMessage.trim()) {
      toast.error('Please provide a message')
      return
    }
    if (reportType === 'member' && !selectedUser) {
      toast.error('Please select a member to report')
      return
    }

    setIsSaving(true)
    try {
      await apiClient.post('/api/circles/report/', {
        type: reportType,
        circle_id: circleId,
        user_id: selectedUser || null,
        message: reportMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Report submitted 🚩')
      setReportMessage('')
      setSelectedUser('')
    } catch (error) {
      toast.error('Failed to submit report')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCircle = async () => {
    if (!window.confirm('CRITICAL: This will permanently delete the study circle and all its contents. Type the circle name to confirm.')) return
    const confirmName = window.prompt(`Type "${circleData.name}" to confirm:`)
    if (confirmName !== circleData.name) {
      toast.error('Name mismatch. Deletion cancelled.')
      return
    }

    try {
      await apiClient.delete(`/api/circles/${circleId}/delete/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Circle deleted successfully')
      onLeaveOrDelete()
    } catch (error) {
      toast.error('Failed to delete circle')
    }
  }

  const handleLeaveCircle = async () => {
    if (!window.confirm('Are you sure you want to leave this circle?')) return
    try {
      await apiClient.post(`/api/circles/${circleId}/leave/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('You have left the circle')
      onLeaveOrDelete()
    } catch (error) {
      toast.error('Failed to leave circle')
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, adminOnly: true },
    { id: 'members', label: 'Members', icon: Users, adminOnly: true },
    { id: 'requests', label: 'Requests', icon: UserCheck, adminOnly: true },
    { id: 'permissions', label: 'Permissions', icon: Shield, adminOnly: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, adminOnly: false },
    { id: 'report', label: 'Report', icon: Flag, adminOnly: false },
    { id: 'danger', label: 'Danger Zone', icon: AlertCircle, adminOnly: false },
  ]

  const filteredTabs = tabs.filter(t => !t.adminOnly || isAdmin)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#4A465F]/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-[#F5F5F5] w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row h-[80vh] border border-white"
          >
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-white/50 border-r border-[#4A465F]/5 p-6 flex flex-col gap-2">
              <div className="mb-8 px-2">
                <h2 className="text-xl font-black text-[#4A465F] tracking-tight">Settings</h2>
                <p className="text-[10px] font-bold text-[#4A465F]/40 uppercase tracking-widest mt-1">
                  {isAdmin ? 'Admin Control' : 'Personal Prefs'}
                </p>
              </div>

              {filteredTabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${
                      isActive 
                        ? 'bg-white shadow-lg shadow-[#4A465F]/5 text-[#5EC2B7]' 
                        : 'text-[#4A465F]/40 hover:text-[#4A465F] hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.id === 'requests' && requests.length > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                        {requests.length}
                      </span>
                    )}
                  </button>
                )
              })}

              <button
                onClick={onClose}
                className="mt-auto flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 font-bold text-sm hover:bg-rose-50 transition-all"
              >
                <X className="w-4 h-4" />
                Close
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#4A465F]/20">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="font-bold">Loading Settings...</p>
                  </div>
                ) : (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    {/* General Settings */}
                    {activeTab === 'general' && (
                      <form onSubmit={handleUpdateGeneral} className="space-y-6">
                        <div className="space-y-4">
                          <label className="block text-sm font-black text-[#4A465F] uppercase tracking-widest">
                            Circle Name
                          </label>
                          <input
                            type="text"
                            value={circleData.name}
                            onChange={(e) => setCircleData({ ...circleData, name: e.target.value })}
                            className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-bold text-[#4A465F]"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="block text-sm font-black text-[#4A465F] uppercase tracking-widest">
                            Description
                          </label>
                          <textarea
                            rows={4}
                            value={circleData.description}
                            onChange={(e) => setCircleData({ ...circleData, description: e.target.value })}
                            className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-bold text-[#4A465F] resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                           <button
                             type="button"
                             onClick={() => setCircleData({ ...circleData, is_private: true })}
                             className={`flex items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all font-black ${
                               circleData.is_private 
                                 ? 'border-[#5EC2B7] bg-[#5EC2B7]/5 text-[#5EC2B7]' 
                                 : 'border-transparent bg-[#F5F5F5] text-[#4A465F]/40 hover:bg-[#F5F5F5]/80'
                             }`}
                           >
                             <Lock className="w-5 h-5" />
                             Private
                           </button>
                           <button
                             type="button"
                             onClick={() => setCircleData({ ...circleData, is_private: false })}
                             className={`flex items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all font-black ${
                               !circleData.is_private 
                                 ? 'border-[#6FB7B4] bg-[#6FB7B4]/5 text-[#6FB7B4]' 
                                 : 'border-transparent bg-[#F5F5F5] text-[#4A465F]/40 hover:bg-[#F5F5F5]/80'
                             }`}
                           >
                             <Globe className="w-5 h-5" />
                             Public
                           </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isSaving}
                          className="w-full py-5 bg-[#5EC2B7] text-white rounded-3xl font-black shadow-xl shadow-[#5EC2B7]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Save Changes
                        </button>
                      </form>
                    )}

                    {/* Members Management */}
                    {activeTab === 'members' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-[#4A465F]">Member Management</h3>
                          <span className="px-3 py-1 bg-[#4A465F]/5 rounded-full text-[10px] font-black text-[#4A465F] uppercase tracking-widest">
                            {members.length} Members
                          </span>
                        </div>
                        <div className="space-y-3">
                          {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-5 bg-[#F5F5F5] rounded-3xl group transition-all hover:bg-white hover:shadow-xl hover:shadow-[#4A465F]/5 border border-transparent hover:border-[#4A465F]/5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6FB7B4] to-[#A8DAD6] flex items-center justify-center text-white font-black">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-black text-[#4A465F]">{member.name}</h4>
                                  <p className="text-[10px] font-bold text-[#4A465F]/30 uppercase tracking-widest">{member.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {member.is_admin ? (
                                  <span className="px-3 py-1 bg-[#5EC2B7]/10 text-[#5EC2B7] rounded-full text-[9px] font-black uppercase tracking-widest">
                                    Admin
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="p-3 text-rose-500/30 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                  >
                                    <UserMinus className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Join Requests */}
                    {activeTab === 'requests' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-black text-[#4A465F]">Pending Requests</h3>
                          <span className="px-3 py-1 bg-amber-500/10 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest">
                            {requests.length} Pending
                          </span>
                        </div>
                        {requests.length === 0 ? (
                          <div className="py-20 text-center text-[#4A465F]/20">
                            <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-10" />
                            <p className="font-bold">No pending requests</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {requests.map((req) => (
                              <div key={req.id} className="flex items-center justify-between p-6 bg-[#F5F5F5] rounded-[2.5rem] border border-[#4A465F]/5">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-[#4A465F]/5 flex items-center justify-center text-[#4A465F]/40 font-black">
                                    {req.user_name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-black text-[#4A465F]">{req.user_name}</h4>
                                    <p className="text-[10px] font-bold text-[#4A465F]/30 uppercase tracking-widest">{req.user_email}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRequestAction(req.id, 'approve')}
                                    className="p-3 bg-white text-[#5EC2B7] hover:bg-[#5EC2B7] hover:text-white rounded-2xl shadow-sm transition-all"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRequestAction(req.id, 'reject')}
                                    className="p-3 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl shadow-sm transition-all"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Permissions */}
                    {activeTab === 'permissions' && (
                      <div className="space-y-10">
                        <div className="space-y-6">
                          <h3 className="text-xl font-black text-[#4A465F]">Resource Permissions</h3>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { id: 'admin_only', label: 'Admin Only', desc: 'Only creators can upload materials' },
                              { id: 'all_members', label: 'All Members', desc: 'Anyone in the circle can share resources' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setCircleData({ ...circleData, resource_permissions: opt.id })}
                                className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all text-left ${
                                  circleData.resource_permissions === opt.id 
                                    ? 'border-[#5EC2B7] bg-[#5EC2B7]/5' 
                                    : 'border-transparent bg-[#F5F5F5] opacity-60 hover:opacity-100'
                                }`}
                              >
                                <div>
                                  <p className="font-black text-[#4A465F]">{opt.label}</p>
                                  <p className="text-[10px] font-bold text-[#4A465F]/40 uppercase tracking-widest mt-1">{opt.desc}</p>
                                </div>
                                {circleData.resource_permissions === opt.id && <div className="w-6 h-6 rounded-full bg-[#5EC2B7] flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          <h3 className="text-xl font-black text-[#4A465F]">Discussion Mode</h3>
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between p-6 bg-[#F5F5F5] rounded-3xl">
                              <div>
                                <p className="font-black text-[#4A465F]">Enable Discussion</p>
                                <p className="text-[10px] font-bold text-[#4A465F]/40 uppercase tracking-widest">Allow members to chat and message</p>
                              </div>
                              <button 
                                onClick={() => setCircleData({ ...circleData, discussion_enabled: !circleData.discussion_enabled })}
                                className={`w-14 h-8 rounded-full transition-all relative ${circleData.discussion_enabled ? 'bg-[#5EC2B7]' : 'bg-[#4A465F]/10'}`}
                              >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${circleData.discussion_enabled ? 'right-1' : 'left-1 shadow-sm'}`} />
                              </button>
                            </div>
                            
                            {circleData.discussion_enabled && (
                              <div className="flex items-center justify-between p-6 bg-[#F5F5F5] rounded-3xl">
                                <div>
                                  <p className="font-black text-[#4A465F]">Restrict to Admin</p>
                                  <p className="text-[10px] font-bold text-[#4A465F]/40 uppercase tracking-widest">Only admins can send messages</p>
                                </div>
                                <button 
                                  onClick={() => setCircleData({ ...circleData, discussion_restricted_to_admin: !circleData.discussion_restricted_to_admin })}
                                  className={`w-14 h-8 rounded-full transition-all relative ${circleData.discussion_restricted_to_admin ? 'bg-amber-500' : 'bg-[#4A465F]/10'}`}
                                >
                                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${circleData.discussion_restricted_to_admin ? 'right-1' : 'left-1 shadow-sm'}`} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={handleUpdateGeneral}
                          disabled={isSaving}
                          className="w-full py-5 bg-[#4A465F] text-white rounded-3xl font-black flex items-center justify-center gap-3 transition-all hover:bg-[#3d3a4f] disabled:opacity-50"
                        >
                          Apply Permission Changes
                        </button>
                      </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-black text-[#4A465F]">Notification Preferences</h3>
                        <div className="space-y-3">
                          {[
                            { id: 'notify_messages', label: 'New Messages', icon: MessageSquare },
                            { id: 'notify_resources', label: 'New Resources', icon: Shield },
                            ...(isAdmin ? [{ id: 'notify_join_requests', label: 'Join Requests', icon: UserCheck }] : [])
                          ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-6 bg-[#F5F5F5] rounded-3xl">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl text-[#4A465F]/40">
                                  <item.icon className="w-5 h-5" />
                                </div>
                                <p className="font-black text-[#4A465F]">{item.label}</p>
                              </div>
                              <button 
                                onClick={() => handleUpdateNotifications({ [item.id]: !circleData.user_settings[item.id] })}
                                className={`w-14 h-8 rounded-full transition-all relative ${circleData.user_settings[item.id] ? 'bg-[#5EC2B7]' : 'bg-[#4A465F]/10'}`}
                              >
                                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${circleData.user_settings[item.id] ? 'right-1' : 'left-1 shadow-sm'}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Report Section */}
                    {activeTab === 'report' && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-[#4A465F]">Submit Report</h3>
                          <p className="text-xs font-bold text-[#4A465F]/40 uppercase tracking-widest">Help us keep the community safe</p>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <label className="block text-sm font-black text-[#4A465F] uppercase tracking-widest">Report Type</label>
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                onClick={() => setReportType('circle')}
                                className={`p-4 rounded-2xl font-black transition-all border-2 ${reportType === 'circle' ? 'bg-[#4A465F]/5 border-[#4A465F] text-[#4A465F]' : 'bg-[#F5F5F5] border-transparent text-[#4A465F]/40'}`}
                              >
                                Report Circle
                              </button>
                              <button
                                onClick={() => setReportType('member')}
                                className={`p-4 rounded-2xl font-black transition-all border-2 ${reportType === 'member' ? 'bg-[#4A465F]/5 border-[#4A465F] text-[#4A465F]' : 'bg-[#F5F5F5] border-transparent text-[#4A465F]/40'}`}
                              >
                                Report Member
                              </button>
                            </div>
                          </div>

                          {reportType === 'member' && (
                            <div className="space-y-4">
                              <label className="block text-sm font-black text-[#4A465F] uppercase tracking-widest">Select Member</label>
                              <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#4A465F]/20 font-bold text-[#4A465F] appearance-none"
                              >
                                <option value="">Choose a member...</option>
                                {members.filter(m => m.id !== circleData?.user_id).map((member) => (
                                  <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="space-y-4">
                            <label className="block text-sm font-black text-[#4A465F] uppercase tracking-widest">Issue Description</label>
                            <textarea
                              rows={4}
                              value={reportMessage}
                              onChange={(e) => setReportMessage(e.target.value)}
                              placeholder="Describe the issue in detail..."
                              className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#4A465F]/20 font-bold text-[#4A465F] resize-none"
                            />
                          </div>

                          <button
                            onClick={handleReport}
                            disabled={isSaving || !reportMessage.trim() || (reportType === 'member' && !selectedUser)}
                            className="w-full py-5 bg-rose-500 text-white rounded-3xl font-black shadow-xl shadow-rose-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                            Submit Report
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Danger Zone */}
                    {activeTab === 'danger' && (
                      <div className="space-y-6 pt-4">
                        <div className="p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 space-y-6">
                          <div className="flex items-center gap-4 text-rose-600">
                            <AlertCircle className="w-8 h-8" />
                            <h3 className="text-xl font-black uppercase tracking-widest">Danger Zone</h3>
                          </div>
                          
                          <p className="text-sm font-bold text-rose-900/60 leading-relaxed">
                            These actions are irreversible. Please proceed with extreme caution.
                          </p>

                          <div className="space-y-4 pt-4">
                            {isAdmin ? (
                              <>
                                <button className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-rose-100 group hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm">
                                  <div className="text-left">
                                    <p className="font-black">Transfer Ownership</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Hand over admin rights to someone else</p>
                                  </div>
                                  <div className="p-3 bg-rose-50 rounded-xl text-rose-500 group-hover:bg-white group-hover:text-rose-500 transition-all">
                                    <UserCheck className="w-5 h-5" />
                                  </div>
                                </button>

                                <button 
                                  onClick={handleDeleteCircle}
                                  className="w-full flex items-center justify-between p-6 bg-rose-500 text-white rounded-3xl shadow-xl shadow-rose-500/20 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                  <div className="text-left">
                                    <p className="font-black">Delete Study Circle</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Permanently delete everything</p>
                                  </div>
                                  <Trash2 className="w-6 h-6" />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={handleLeaveCircle}
                                className="w-full flex items-center justify-between p-6 bg-rose-500 text-white rounded-3xl shadow-xl shadow-rose-500/20 group hover:scale-[1.02] active:scale-[0.98] transition-all"
                              >
                                <div className="text-left">
                                  <p className="font-black">Leave Circle</p>
                                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">You will no longer have access to this circle</p>
                                </div>
                                <LogOut className="w-6 h-6" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
