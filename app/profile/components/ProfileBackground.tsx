'use client'

import { motion } from 'framer-motion'

export default function ProfileBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#F5F5F5] overflow-hidden">
      {/* Dynamic Blobs */}
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-5%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[90px] bg-[#6FB7B4]/10"
      />
      
      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 90, 0],
          scale: [1, 0.95, 1],
          rotate: [0, -15, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full blur-[110px] bg-[#5EC2B7]/15"
      />

      <motion.div
        animate={{
          x: [0, 40, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] rounded-full blur-[80px] bg-[#A8DAD6]/10"
      />

      {/* Layered Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-[#F5F5F5]/40 pointer-events-none" />
    </div>
  )
}
