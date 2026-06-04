'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ProfileData } from '../lib/types'
import { Edit2, Save, User, Mail, Target, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PersonalInfoProps {
  profile: ProfileData;
  onUpdate: (data: Partial<ProfileData>) => Promise<any>;
}

export default function PersonalInfo({ profile, onUpdate }: PersonalInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: profile.name,
    description: profile.description
  })

  const handleSubmit = async () => {
    if (!isEditing) {
        setIsEditing(true)
        return
    }

    try {
        setLoading(true)
        await onUpdate(formData)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
    } catch (error) {
        toast.error('Failed to update profile.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#4A465F]/5 space-y-10 relative overflow-hidden group">
      <div className="absolute top-[-10%] right-[-10%] w-[150px] h-[150px] rounded-full blur-[40px] bg-[#6FB7B4]/5" />
      
      <div className="flex items-center justify-between pb-6 border-b border-[#4A465F]/10">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-[#4A465F] tracking-tight flex items-center gap-4">
            Personal Information
            <div className="h-[2px] w-12 bg-[#6FB7B4]/30 rounded-full" />
          </h2>
          <p className="text-sm font-bold text-[#4A465F]/40 uppercase tracking-widest">
            Manage your academic identity
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading}
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg ${
            isEditing 
              ? 'bg-[#5EC2B7] text-white shadow-[#5EC2B7]/20 shadow-lg' 
              : 'bg-[#F5F5F5] text-[#4A465F] hover:bg-[#6FB7B4] hover:text-white group'
          }`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isEditing ? (
            <>
              Save Changes
              <Save className="w-5 h-5" />
            </>
          ) : (
            <>
              Edit Profile
              <Edit2 className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-2">
        <div className="space-y-4">
          <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest pl-2 flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Full Name
          </label>
          <div className="relative group">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              readOnly={!isEditing}
              className={`w-full px-8 py-5 rounded-2xl bg-[#F5F5F5]/60 border-2 border-transparent transition-all outline-none text-[#4A465F] font-bold text-lg ${
                isEditing ? 'border-[#6FB7B4] focus:ring-8 focus:ring-[#6FB7B4]/5 bg-white' : 'pointer-events-none'
              }`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest pl-2 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" /> Email Address
          </label>
          <div className="relative group">
            <input
              type="email"
              value={profile.email}
              readOnly={true}
              className={`w-full px-8 py-5 rounded-2xl bg-[#F5F5F5]/60 border-2 border-transparent transition-all outline-none text-[#4A465F]/40 font-bold text-lg pointer-events-none`}
            />
          </div>
        </div>

        <div className="space-y-4 md:col-span-2">
          <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest pl-2 flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Profile Bio
          </label>
          <div className="relative group">
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              readOnly={!isEditing}
              placeholder="Tell others about your study goals and interests..."
              className={`w-full px-8 py-5 rounded-2xl bg-[#F5F5F5]/60 border-2 border-transparent transition-all outline-none text-[#4A465F] font-bold text-lg resize-none ${
                isEditing ? 'border-[#6FB7B4] focus:ring-8 focus:ring-[#6FB7B4]/5 bg-white shadow-inner' : 'pointer-events-none'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
