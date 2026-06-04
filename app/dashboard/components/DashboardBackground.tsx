'use client'

import { motion } from 'framer-motion'

export default function DashboardBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Large background blobs */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 90, 180, 270, 360],
          x: [0, 30, 0, -30, 0],
          y: [0, -20, 0, 20, 0]
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 right-1/4 w-96 h-96 blob-shape opacity-3"
      />
      
      <motion.div
        animate={{ 
          scale: [1.1, 1, 1.1],
          rotate: [360, 270, 180, 90, 0],
          x: [0, -25, 0, 25, 0],
          y: [0, 25, 0, -25, 0]
        }}
        transition={{ 
          duration: 45, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/4 left-1/4 w-80 h-80 opacity-3"
        style={{ 
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'linear-gradient(135deg, #4A465F 0%, #6FB7B4 100%)'
        }}
      />

      {/* Medium floating elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -50, 0, 50, 0],
            x: [0, 25, 0, -25, 0],
            scale: [1, 1.2, 1, 0.8, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20 + i * 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2
          }}
          className="absolute w-32 h-32 rounded-full opacity-5"
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${15 + (i * 10)}%`,
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
        />
      ))}

      {/* Small particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{ 
            y: [0, -80, 0],
            x: [0, Math.sin(i) * 40, 0],
            scale: [0.5, 1.2, 0.5],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ 
            duration: 12 + i * 1.2, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6
          }}
          className="absolute w-6 h-6 bg-accent rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-secondary/5 opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/30 to-transparent" />
    </div>
  )
}