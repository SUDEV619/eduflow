
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, User, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'

interface Message {
  id: number
  sender_name: string
  sender_email: string
  content: string
  created_at: string
}

export default function Discussion({ circleId }: { circleId: string }) {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async (silent = false) => {
    if (!token) return
    if (!silent) setIsLoading(true)
    try {
      const res = await apiClient.get(`/api/circles/${circleId}/messages/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("Discussion mounted for circle:", circleId);
    fetchMessages()
    // Simple polling for real-time feel - 3 seconds
    const interval = setInterval(() => fetchMessages(true), 3000)
    return () => clearInterval(interval)
  }, [circleId, token])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Send attempt. Content:", newMessage.trim());
    
    if (!newMessage.trim() || !token || isSending) {
      console.log("Send blocked: empty, no token, or already sending");
      return
    }

    const contentToSend = newMessage
    setNewMessage('') // Clear input immediately for UX
    setIsSending(true)
    try {
      console.log("Posting message to API...");
      const res = await apiClient.post(`/api/circles/${circleId}/messages/`, 
        { content: contentToSend },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log("Message sent successfully:", res.data);
      setMessages(prev => [...prev, res.data])
    } catch (error: any) {
      console.error('Failed to send message:', error.response?.data || error.message)
      setNewMessage(contentToSend) // Restore if failed
      alert("Failed to send message. Ensure you are a member of this circle.")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-[#4A465F]/20">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-bold">Loading discussion...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[#F5F5F5]/30"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#4A465F]/20">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="font-bold">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_email === user?.email
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#4A465F]/5 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#4A465F]/40" />
                    </div>
                  )}
                  <div className="space-y-1">
                    {!isMe && (
                      <p className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">
                        {msg.sender_name}
                      </p>
                    )}
                    <div className={`p-4 rounded-2xl text-sm font-medium shadow-sm ${
                      isMe 
                        ? 'bg-[#5EC2B7] text-white rounded-tr-none' 
                        : 'bg-white text-[#4A465F] rounded-tl-none border border-[#4A465F]/5'
                    }`}>
                      {msg.content}
                    </div>
                    <p className={`text-[9px] font-bold text-[#4A465F]/30 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-[#4A465F]/5">
        <form onSubmit={handleSend} className="flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-medium text-[#4A465F] transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-14 h-14 bg-[#4A465F] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#4A465F]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
          </button>
        </form>
      </div>
    </div>
  )
}
