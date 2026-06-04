'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Globe, Shield, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ShowcaseToggleProps {
  initialValue: boolean;
  onToggle: (value: boolean) => Promise<any>;
}

export default function ShowcaseToggle({ initialValue, onToggle }: ShowcaseToggleProps) {
  const [isOn, setIsOn] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    try {
        setLoading(true)
        const nextValue = !isOn
        await onToggle(nextValue)
        setIsOn(nextValue)
        toast.success(`Profile is now ${nextValue ? 'Public' : 'Private'}`)
    } catch (error) {
        toast.error('Failed to update privacy setting.')
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-[#4A465F]/5 space-y-10 relative overflow-hidden group">
      <div className="absolute top-[-10%] left-[-10%] w-[150px] h-[150px] rounded-full blur-[40px] bg-[#5EC2B7]/5" />
      
      <div className="flex items-center justify-between gap-12">
        <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1">
          <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center transition-all duration-700 shadow-2xl ${
            isOn ? 'bg-[#5EC2B7] text-white shadow-[#5EC2B7]/30' : 'bg-gray-100 text-[#4A465F]/40'
          }`}>
            {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : isOn ? <Globe className="w-10 h-10" /> : <Shield className="w-10 h-10" />}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-[#4A465F] tracking-tight">
              Public Showcase
            </h3>
            <p className="text-[#2E2E2E]/50 text-base font-bold leading-relaxed max-w-xl">
              When enabled, other learners and study circles can view your progress, achievements, 
              and study goals to foster collaboration and healthy motivation.
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleToggle}
          disabled={loading}
          className={`w-32 h-16 rounded-full p-2 transition-all duration-700 relative shadow-inner overflow-hidden flex items-center shadow-lg ${
            isOn ? 'bg-[#5EC2B7]/10' : 'bg-gray-100'
          }`}
        >
          {isOn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-[#5EC2B7] to-white/5 opacity-10"
            />
          )}

          <motion.div
            animate={{ 
              x: isOn ? 64 : 0,
              backgroundColor: isOn ? '#5EC2B7' : '#4A465F',
              boxShadow: isOn ? '0 10px 20px -5px rgba(94, 194, 183, 0.4)' : '0 10px 20px -5px rgba(74, 70, 95, 0.2)'
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`w-12 h-12 rounded-full relative z-10 flex items-center justify-center p-3 text-white transition-all`}
          >
            {isOn ? <Globe className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </motion.div>
        </motion.button>
      </div>
    </div>
  )
}
