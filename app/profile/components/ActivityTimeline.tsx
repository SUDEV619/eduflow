'use client'

import { motion } from 'framer-motion'
import { TimelineItem } from '../lib/types'
import { Clock, CheckCircle2, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useRef } from 'react'

interface ActivityTimelineProps {
  timeline: TimelineItem[];
}

export default function ActivityTimeline({ timeline }: ActivityTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' })
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#4A465F]/5 space-y-10 relative overflow-hidden group w-full">
      <div className="absolute top-[-10%] left-[-10%] w-[200px] h-[200px] rounded-full blur-[50px] bg-[#6FB7B4]/5 group-hover:bg-[#6FB7B4]/10 transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#4A465F]/10 px-2">
        <div className="space-y-1">
          <h3 className="text-3xl font-black text-[#4A465F] tracking-tight flex items-center gap-4">
            Journey Map
            <div className="h-[2px] w-12 bg-[#6FB7B4]/30 rounded-full" />
          </h3>
          <p className="text-sm font-bold text-[#4A465F]/40 uppercase tracking-widest">
            Your learning progression timeline
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => scroll('left')}
            className="p-3 rounded-xl bg-[#F5F5F5] text-[#4A465F]/40 hover:bg-[#6FB7B4] hover:text-white transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-3 rounded-xl bg-[#F5F5F5] text-[#4A465F]/40 hover:bg-[#6FB7B4] hover:text-white transition-all shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative pt-12 pb-8">
        {/* Horizontal Connector Line */}
        <div className="absolute top-[60px] left-0 right-0 h-[3px] bg-gradient-to-r from-[#6FB7B4]/40 via-[#5EC2B7]/20 to-transparent rounded-full mx-8" />

        <div 
          ref={scrollRef}
          className="overflow-x-auto flex items-start gap-12 px-8 no-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {timeline.length > 0 ? timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              className="relative flex flex-col items-center min-w-[280px] group/item"
            >
              {/* Timeline Dot */}
              <div className="absolute top-[12px] left-1/2 -translate-x-1/2 z-20">
                <motion.div 
                  whileHover={{ scale: 1.5 }}
                  className={`w-6 h-6 rounded-full border-4 border-white shadow-lg transition-colors duration-300 ${
                    item.type === 'study' ? 'bg-[#6FB7B4]' : 'bg-[#5EC2B7]'
                  }`}
                />
              </div>

              {/* Card */}
              <div className="mt-16 w-full bg-[#F5F5F5] p-6 rounded-[2rem] border border-transparent group-hover/item:border-[#6FB7B4]/20 group-hover/item:bg-white group-hover/item:shadow-xl transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6FB7B4]/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl ${
                      item.type === 'study' ? 'bg-[#6FB7B4]/10 text-[#6FB7B4]' : 'bg-[#5EC2B7]/10 text-[#5EC2B7]'
                    }`}>
                      {item.type === 'study' ? <BookOpen className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-black text-[#4A465F]/30 uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-[#4A465F]/5">
                      {formatDate(item.date)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-[#4A465F] group-hover/item:text-[#6FB7B4] transition-colors leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-sm font-bold text-[#2E2E2E]/50 leading-relaxed line-clamp-2">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="w-full py-20 flex flex-col items-center justify-center space-y-4 opacity-20 mx-auto">
                <Clock className="w-12 h-12 text-[#4A465F]" />
                <p className="text-xl font-black uppercase tracking-widest text-[#4A465F]">The journey is about to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Scroll Progress Indicator (Optional visual cue) */}
      <div className="flex justify-center pt-4">
         <div className="h-1 w-32 bg-[#4A465F]/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#6FB7B4] rounded-full"
              initial={{ width: "30%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 2 }}
            />
         </div>
      </div>
    </div>
  )
}
