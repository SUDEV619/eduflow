'use client'

import { motion } from 'framer-motion'
import { Send, Smile, Paperclip } from 'lucide-react'
import { useState } from 'react'
import { Message } from '../lib/data'

interface DiscussionSectionProps {
  messages: Message[];
}

export default function DiscussionSection({ messages }: DiscussionSectionProps) {
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="flex flex-col h-[650px] bg-white rounded-[2.5rem] shadow-sm border border-[#4A465F]/5 overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-[#6FB7B4]/20 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-4 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
          >
            <div className="flex-shrink-0">
              <img 
                src={msg.avatar} 
                alt={msg.user} 
                className="w-12 h-12 rounded-2xl border-2 border-[#6FB7B4]/10 shadow-sm"
              />
            </div>
            
            <div className={`max-w-[70%] space-y-2 ${index % 2 === 0 ? '' : 'items-end flex flex-col'}`}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#4A465F]">{msg.user}</span>
                <span className="text-[10px] font-bold text-[#4A465F]/30 uppercase tracking-widest">{msg.timestamp}</span>
              </div>
              <div className={`px-6 py-4 rounded-[1.5rem] shadow-sm relative overflow-hidden ${
                index % 2 === 0 
                  ? 'bg-[#F5F5F5] text-[#2E2E2E] rounded-tl-none' 
                  : 'bg-[#5EC2B7] text-white rounded-tr-none'
              }`}>
                {index % 2 === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                )}
                <p className="relative z-10 font-medium leading-relaxed">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-8 bg-[#F5F5F5]/30 border-t border-[#4A465F]/5 backdrop-blur-sm">
        <div className="relative group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Share your thoughts with the circle..."
            className="w-full pl-6 pr-32 py-5 rounded-2xl bg-white border border-[#4A465F]/10 focus:border-[#6FB7B4] focus:ring-8 focus:ring-[#6FB7B4]/5 transition-all outline-none text-[#4A465F] font-medium shadow-sm transition-all"
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <button className="p-3 text-[#4A465F]/40 hover:text-[#4A465F] transition-colors rounded-xl bg-transparent hover:bg-[#F5F5F5]">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-3 text-[#4A465F]/40 hover:text-[#4A465F] transition-colors rounded-xl bg-transparent hover:bg-[#F5F5F5]">
              <Smile className="w-5 h-5" />
            </button>
            <motion.button
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-[#5EC2B7] text-white rounded-xl shadow-lg shadow-[#5EC2B7]/20 hover:shadow-[#5EC2B7]/40 transition-shadow"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
