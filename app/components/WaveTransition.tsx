'use client'

import { motion } from 'framer-motion'

export default function WaveTransition() {
  return (
    <div className="relative h-32 overflow-hidden">
      <motion.svg
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"
          fill="url(#waveGradient)"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A8DAD6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#6FB7B4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#5EC2B7" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </motion.svg>
      
      {/* Additional wave layers for depth */}
      <motion.svg
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: "easeInOut", delay: 0.3 }}
        className="absolute bottom-0 w-full h-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,80 C400,20 800,100 1200,40 L1200,120 L0,120 Z"
          fill="url(#waveGradient2)"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
        />
        <defs>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A465F" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6FB7B4" stopOpacity="0.5" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  )
}