
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, ChevronDown, CheckCircle2, X } from 'lucide-react'

export const standardizedSubjects = [
  { id: 'quantitative_aptitude', label: 'Quantitative Aptitude' },
  { id: 'general_reasoning', label: 'General Reasoning' },
  { id: 'english', label: 'English' },
  { id: 'history', label: 'History' },
  { id: 'geography', label: 'Geography' },
  { id: 'polity', label: 'Polity' },
  { id: 'general_science', label: 'General Science' },
  { id: 'economy', label: 'Economy' },
  { id: 'current_affairs', label: 'Current Affairs' },
]

interface SubjectFilterProps {
  selectedSubjects: string[]
  onToggle: (subjectId: string) => void
  onClear: () => void
}

export default function SubjectFilter({ selectedSubjects, onToggle, onClear }: SubjectFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`px-6 py-3 bg-white rounded-xl font-bold text-[#4A465F]/60 flex items-center gap-3 hover:bg-[#F5F5F5] transition-all border border-[#4A465F]/5 shadow-sm ${isOpen ? 'ring-2 ring-[#5EC2B7]/20' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Subjects
            {selectedSubjects.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#5EC2B7] text-white text-[10px] flex items-center justify-center">
                {selectedSubjects.length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 z-[60] w-64 bg-white rounded-2xl shadow-2xl border border-[#4A465F]/5 p-2"
              >
                {standardizedSubjects.map(sub => (
                  <div 
                    key={sub.id}
                    onClick={() => onToggle(sub.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      selectedSubjects.includes(sub.id) 
                        ? 'bg-[#5EC2B7]/10 text-[#5EC2B7]' 
                        : 'hover:bg-[#F5F5F5] text-[#4A465F]/60'
                    }`}
                  >
                    <span className="font-bold text-sm">{sub.label}</span>
                    {selectedSubjects.includes(sub.id) && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                ))}
                {selectedSubjects.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#4A465F]/5">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onClear()
                        setIsOpen(false)
                      }}
                      className="w-full p-2 text-xs font-black text-rose-500 hover:bg-rose-50 rounded-lg transition-colors uppercase tracking-widest"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chips */}
      <AnimatePresence>
        {selectedSubjects.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedSubjects.map(subId => {
              const label = standardizedSubjects.find(s => s.id === subId)?.label || subId
              return (
                <motion.div
                  key={subId}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#A8DAD6]/20 text-[#6FB7B4] rounded-full border border-[#A8DAD6]/30"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
                  <button onClick={() => onToggle(subId)} className="hover:text-[#4A465F] transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
