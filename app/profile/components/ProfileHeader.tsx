'use client'

import { motion } from 'framer-motion'
import { ProfileData } from '../lib/types'
import { Trophy, BarChart3, Book } from 'lucide-react'

interface ProfileHeaderProps {
  profile: ProfileData;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[3rem] p-12 shadow-sm border border-[#4A465F]/5 relative overflow-hidden group"
    >
      {/* Visual Decoration Blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] rounded-full blur-[70px] bg-[#6FB7B4]/10 group-hover:bg-[#6FB7B4]/20 transition-all duration-700" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full blur-[60px] bg-[#5EC2B7]/10 group-hover:bg-[#5EC2B7]/20 transition-all duration-700" />

      {/* Floating Icons for Artwork */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 right-24 text-[#6FB7B4]/40"
      >
        <Trophy className="w-10 h-10" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-12 right-48 text-[#5EC2B7]/30"
      >
        <BarChart3 className="w-8 h-8" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-48 right-12 text-[#4A465F]/15"
      >
        <Book className="w-12 h-12" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center md:items-start md:flex-row gap-12">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          className="relative group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6FB7B4] to-[#5EC2B7] rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
          <img 
            src={profile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6FB7B4&color=fff&size=200`} 
            alt={profile.name} 
            className="w-44 h-44 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl relative z-10"
          />
          <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-[#F5F5F5] z-20">
            <span className="text-2xl">⚡</span>
          </div>
        </motion.div>

        <div className="space-y-6 text-center md:text-left flex-1 max-w-2xl">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-[#4A465F] tracking-tight leading-none group-hover:text-[#6FB7B4] transition-colors">
              {profile.name}
            </h1>
            <p className="text-lg font-bold text-[#2E2E2E]/40 uppercase tracking-[0.2em] inline-block px-4 py-1 rounded-full bg-[#F5F5F5]">
              {profile.role === 'ADMIN' ? 'Administrator' : 'Premier Learner'}
            </p>
          </div>
          
          <p className="text-[#2E2E2E]/60 text-xl font-medium leading-relaxed max-w-xl">
            {profile.description || "No bio yet. Start your journey by telling us about yourself!"}
          </p>

          <div className="flex flex-wrap gap-3">
            {/* Using joined date as a placeholder for badges/info if needed */}
            <span className="px-5 py-2 rounded-xl bg-[#6FB7B4]/10 text-[#6FB7B4] text-xs font-black uppercase tracking-widest border border-[#6FB7B4]/20">
              Joined {new Date(profile.date_joined).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
