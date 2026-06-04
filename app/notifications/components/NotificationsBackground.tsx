'use client'

import { motion } from 'framer-motion'

export default function NotificationsBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#F5F5F5]">
      {/* Background radial gradient grid */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(74, 70, 95, 0.03) 1px, transparent 0)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Floating abstract blobs */}
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[15%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#6FB7B4]/10 to-[#5EC2B7]/5 blur-[120px]"
      />
      <motion.div
        animate={{
          x: [0, -60, 60, 0],
          y: [0, 60, -60, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#A8DAD6]/15 to-[#6FB7B4]/5 blur-[150px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px]"
      />
    </div>
  )
}
