'use client'

import { motion } from 'framer-motion'
import { Bell, Shield, Smartphone, Mail, Globe } from 'lucide-react'
import { useState } from 'react'
import { notificationSettings } from '../lib/data'

export default function NotificationSettings() {
  const [settings, setSettings] = useState(notificationSettings)

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, initialValue: !s.initialValue } : s))
  }

  return (
    <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-[#4A465F]/5 space-y-12 relative overflow-hidden group">
      <div className="absolute top-[-10%] left-[-10%] w-[200px] h-[200px] rounded-full blur-[50px] bg-[#6FB7B4]/5" />
      
      <div className="flex items-center justify-between pb-6 border-b border-[#4A465F]/10">
        <h3 className="text-3xl font-black text-[#4A465F] tracking-tight">
          Notification Preferences
        </h3>
        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-[#4A465F]/40">
          <Bell className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-8">
        {settings.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-8 rounded-[2rem] bg-[#F5F5F5]/50 border border-transparent hover:border-[#6FB7B4]/20 hover:bg-white @transition-all duration-300 group/item"
          >
            <div className="space-y-2">
              <h4 className="text-xl font-black text-[#4A465F] group-hover/item:text-[#6FB7B4] transition-colors">
                {item.label}
              </h4>
              <p className="text-[#2E2E2E]/50 text-base font-bold leading-relaxed max-w-lg">
                {item.description}
              </p>
            </div>

            <button
              onClick={() => toggleSetting(item.id)}
              className={`w-20 h-10 rounded-full p-1.5 transition-all duration-500 relative shadow-inner overflow-hidden flex items-center ${
                item.initialValue ? 'bg-[#5EC2B7]/10' : 'bg-gray-100'
              }`}
            >
              <motion.div
                animate={{ 
                  x: item.initialValue ? 40 : 0,
                  backgroundColor: item.initialValue ? '#5EC2B7' : '#4A465F'
                }}
                className="w-7 h-7 rounded-full shadow-lg z-10"
              />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="pt-8 border-t border-[#4A465F]/10 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4 text-[#4A465F]/40">
           <Shield className="w-5 h-5" />
           <p className="text-sm font-black tracking-widest uppercase">Privacy & Data Security active</p>
         </div>
         
         <div className="flex gap-4">
           {[Smartphone, Mail, Globe].map((Icon, i) => (
             <div key={i} className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center text-[#4A465F]/20 hover:text-[#6FB7B4] transition-all cursor-pointer border border-[#4A465F]/5">
               <Icon className="w-5 h-5" />
             </div>
           ))}
         </div>
      </div>
    </div>
  )
}
