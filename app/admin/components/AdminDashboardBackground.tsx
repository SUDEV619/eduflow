'use client'

import { motion } from 'framer-motion'

export default function AdminDashboardBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Premium Gradient Base */}
      <div className="absolute inset-0 bg-[#F5F5F5]" />
      
      {/* Subtle Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#6FB7B4]/5 blur-[120px] rounded-full"
      />
      
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -150, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-[#5EC2B7]/5 blur-[150px] rounded-full"
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4A465F 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
    </div>
  )
}
