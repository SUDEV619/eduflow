
'use client'

import { motion } from 'framer-motion'
import { BookOpen, FileText } from 'lucide-react'

interface SessionControlsProps {
  currentSession: any
  setCurrentSession: (session: any) => void
}

export const STUDY_SUBJECTS = [
  { id: "quantitative_aptitude", label: "Quantitative Aptitude" },
  { id: "general_reasoning", label: "General Reasoning" },
  { id: "english", label: "English" },
  { id: "history", label: "History" },
  { id: "geography", label: "Geography" },
  { id: "polity", label: "Polity" },
  { id: "economy", label: "Economy" },
  { id: "general_science", label: "General Science" }
];

export default function SessionControls({ currentSession, setCurrentSession }: SessionControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#4A465F]/5"
    >
      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#5EC2B7]/10 rounded-2xl flex items-center justify-center text-[#5EC2B7]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#4A465F]">Current Session Configuration</h3>
            <p className="text-[#4A465F]/40 text-sm font-medium">Select your subject before starting the timer</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Subject Selector */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-2">Active Subject</label>
            <div className="relative">
              <select
                value={currentSession.subject}
                onChange={(e) => setCurrentSession({ ...currentSession, subject: e.target.value })}
                className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-bold text-[#4A465F] transition-all appearance-none cursor-pointer"
              >
                <option value="">Choose your focus subject</option>
                {STUDY_SUBJECTS.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.label}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#4A465F]/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Topic Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-2">Topic or Focus Area</label>
            <input
              type="text"
              value={currentSession.topic}
              onChange={(e) => setCurrentSession({ ...currentSession, topic: e.target.value })}
              placeholder="e.g., Quantum Mechanics, Calculus III"
              className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-bold text-[#4A465F] transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-2 flex items-center gap-2">
            <FileText className="w-3 h-3" />
            Session Intentions
          </label>
          <textarea
            value={currentSession.notes}
            onChange={(e) => setCurrentSession({ ...currentSession, notes: e.target.value })}
            placeholder="What is your primary goal for this session? Any specific challenges to tackle?"
            rows={3}
            className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-bold text-[#4A465F] transition-all resize-none shadow-inner"
          />
        </div>

        {/* Quick Tips */}
        <div className="bg-[#F5F5F5] rounded-2xl p-6 border border-[#4A465F]/5">
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <div className="text-sm font-black text-[#4A465F] mb-1">Study Tip</div>
              <p className="text-xs text-[#4A465F]/60 font-medium leading-relaxed">
                Break complex topics into smaller, manageable chunks. A single 25-minute Pomodoro is perfect for deep-diving into one specific concept.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
