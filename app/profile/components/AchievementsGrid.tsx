'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '../lib/data'
import { CheckCircle2, Lock, BadgeCheck } from 'lucide-react'

interface AchievementsGridProps {
  achievements: Achievement[];
}

export default function AchievementsGrid({ achievements }: AchievementsGridProps) {
  return (
    <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#4A465F]/5 space-y-12 relative overflow-hidden group">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#6FB7B4]/5 to-transparent blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between pb-6 border-b border-[#4A465F]/10 px-4">
        <h3 className="text-3xl font-black text-[#4A465F] tracking-tight flex items-center gap-4">
          Achievements & Badges
          <div className="h-[2px] w-12 bg-[#6FB7B4]/30 rounded-full" />
        </h3>
        
        <div className="flex gap-4">
          <div className="px-6 py-2 rounded-xl bg-orange-100/40 text-orange-600 text-sm font-black border border-orange-100 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4" />
            {achievements.filter(a => a.unlocked).length} Unlocked
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 px-4">
        {achievements.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -10, rotate: 2 }}
            className={`flex flex-col items-center p-8 rounded-[3rem] relative overflow-hidden transition-all h-full ${
              item.unlocked 
                ? 'bg-[#F5F5F5] border-2 border-[#6FB7B4]/20 shadow-xl shadow-[#6FB7B4]/5 group cursor-pointer' 
                : 'bg-[#F5F5F5]/40 border-2 border-transparent grayscale'
            }`}
          >
            {/* Soft inner glow for unlocked badges */}
            {item.unlocked && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#6FB7B4]/10 to-transparent opacity-50" />
            )}

            <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl relative shadow-2xl ${
                item.unlocked 
                  ? 'bg-white shadow-[#6FB7B4]/20 animate-pulse-slow' 
                  : 'bg-[#4A465F]/5'
              }`}>
                {item.icon}
                {item.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-[#5EC2B7] text-white p-2 rounded-full shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </motion.div>
                )}
                {!item.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <Lock className="w-10 h-10 text-[#4A465F]" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className={`text-lg font-black tracking-tight ${
                  item.unlocked ? 'text-[#4A465F]' : 'text-[#4A465F]/40'
                }`}>
                  {item.name}
                </h4>
                <p className={`text-xs font-bold leading-relaxed ${
                  item.unlocked ? 'text-[#4A465F]/50' : 'text-[#4A465F]/20'
                }`}>
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Add slow pulse animation to tailwind config? No can use inline for now or Framer.
