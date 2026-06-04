'use client'

import { motion } from 'framer-motion'

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Large background blobs */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 45, 90, 135, 180],
          x: [0, 30, 0, -30, 0],
          y: [0, -20, 0, 20, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 right-1/4 w-80 h-80 blob-shape opacity-5"
      />
      
      <motion.div
        animate={{ 
          scale: [1.1, 1, 1.1],
          rotate: [180, 135, 90, 45, 0],
          x: [0, -25, 0, 25, 0],
          y: [0, 25, 0, -25, 0]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/4 left-1/4 w-96 h-96 opacity-5"
        style={{ 
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'linear-gradient(135deg, #4A465F 0%, #6FB7B4 100%)'
        }}
      />

      {/* Medium floating elements */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -40, 0, 40, 0],
            x: [0, 20, 0, -20, 0],
            scale: [1, 1.2, 1, 0.8, 1],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ 
            duration: 12 + i * 3, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5
          }}
          className="absolute w-24 h-24 rounded-full opacity-8"
          style={{
            left: `${5 + (i * 15)}%`,
            top: `${10 + (i * 12)}%`,
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
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{ 
            y: [0, -60, 0],
            x: [0, Math.sin(i) * 30, 0],
            scale: [0.5, 1, 0.5],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ 
            duration: 8 + i * 0.8, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4
          }}
          className="absolute w-4 h-4 bg-accent rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-secondary/10 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/50 to-transparent" />
    </div>
  )
}