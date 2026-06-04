'use client'

import { motion } from 'framer-motion'

export default function StudyBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Large background blobs */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 120, 240, 360],
          x: [0, 40, 0, -40, 0],
          y: [0, -30, 0, 30, 0]
        }}
        transition={{ 
          duration: 50, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 right-1/3 w-96 h-96 blob-shape opacity-4"
      />
      
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [360, 240, 120, 0],
          x: [0, -35, 0, 35, 0],
          y: [0, 35, 0, -35, 0]
        }}
        transition={{ 
          duration: 55, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/3 left-1/4 w-80 h-80 opacity-4"
        style={{ 
          borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%',
          background: 'linear-gradient(135deg, #4A465F 0%, #6FB7B4 100%)'
        }}
      />

      {/* Medium floating study elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -60, 0, 60, 0],
            x: [0, 30, 0, -30, 0],
            scale: [1, 1.3, 1, 0.7, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            duration: 25 + i * 8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 3
          }}
          className="absolute w-24 h-24 rounded-full opacity-6 flex items-center justify-center text-2xl"
          style={{
            left: `${15 + (i * 14)}%`,
            top: `${20 + (i * 12)}%`,
            background: `linear-gradient(135deg, ${
              i % 4 === 0 ? '#A8DAD6' : 
              i % 4 === 1 ? '#6FB7B4' : 
              i % 4 === 2 ? '#5EC2B7' : '#4A465F'
            } 0%, ${
              i % 4 === 0 ? '#6FB7B4' : 
              i % 4 === 1 ? '#5EC2B7' : 
              i % 4 === 2 ? '#A8DAD6' : '#6FB7B4'
            } 100%)`,
            borderRadius: i % 3 === 0 ? '50%' : 
                          i % 3 === 1 ? '30% 70% 70% 30% / 30% 30% 70% 70%' : 
                          '40% 60% 60% 40% / 60% 30% 70% 40%'
          }}
        >
          <span className="text-white/60">
            {i % 6 === 0 ? '📚' : 
             i % 6 === 1 ? '⏱️' : 
             i % 6 === 2 ? '📊' : 
             i % 6 === 3 ? '🎯' : 
             i % 6 === 4 ? '💡' : '✨'}
          </span>
        </motion.div>
      ))}

      {/* Small floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{ 
            y: [0, -100, 0],
            x: [0, Math.sin(i) * 50, 0],
            scale: [0.3, 1.5, 0.3],
            opacity: [0.1, 0.5, 0.1]
          }}
          transition={{ 
            duration: 15 + i * 2, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
          className="absolute w-8 h-8 bg-accent rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Subtle study-themed illustrations */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 60, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-3"
      >
        <div className="relative w-full h-full">
          {/* Circular dotted pattern */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 bg-accent/20 rounded-full"
              style={{
                left: `${50 + 40 * Math.cos((i * 30) * Math.PI / 180)}%`,
                top: `${50 + 40 * Math.sin((i * 30) * Math.PI / 180)}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-secondary/8 opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-bl from-accent/5 via-transparent to-button/5" />
    </div>
  )
}