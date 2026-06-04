'use client'

import { motion } from 'framer-motion'
import { MoreVertical, Mail, Star, Flame, Trophy } from 'lucide-react'
import { Member } from '../lib/data'

interface MembersSectionProps {
  members: Member[];
}

export default function MembersSection({ members }: MembersSectionProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#4A465F]/5 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#4A465F]/10">
        <h3 className="text-2xl font-bold text-[#4A465F]">
          Active Members <span className="text-[#6FB7B4] ml-2 font-extrabold">{members.length}</span>
        </h3>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-100/30 text-orange-600 text-sm font-bold border border-orange-100 transition-all hover:bg-orange-100/50">
            <Flame className="w-4 h-4" />
            Most Active Circle
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-100/30 text-indigo-600 text-sm font-bold border border-indigo-100 transition-all hover:bg-indigo-100/50">
            <Trophy className="w-4 h-4" />
            Top Collaborators
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(0,0,0,0.1)" }}
            className="flex flex-col items-center bg-[#F5F5F5] p-8 rounded-[2.5rem] relative group border border-transparent hover:border-[#6FB7B4]/10 transition-all overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-br from-[#6FB7B4]/10 to-transparent group-hover:from-[#6FB7B4]/20 transition-all" />

            <div className="relative z-10 flex flex-col items-center space-y-6">
              <div className="relative">
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="w-24 h-24 rounded-3xl border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-500 ease-out"
                />
                {member.activity === 'High' && (
                  <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-green-500 text-white shadow-lg shadow-green-200 animate-pulse">
                    <Star className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-[#4A465F] tracking-tight group-hover:text-[#6FB7B4] transition-colors">{member.name}</h4>
                <div className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full ${
                  member.activity === 'High' ? 'bg-green-100 text-green-700' : 
                  member.activity === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {member.activity} Activity
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button className="p-3 bg-white text-[#4A465F]/40 hover:text-[#6FB7B4] hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                  <Mail className="w-5 h-5" />
                </button>
                <button className="p-3 bg-white text-[#4A465F]/40 hover:text-[#4A465F] hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
