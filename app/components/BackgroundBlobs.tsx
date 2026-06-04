'use client'

import { motion } from 'framer-motion'

export default function BackgroundBlobs() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      {/* Large background blobs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
          x: [0, 50, 0, -50, 0],
          y: [0, -30, 0, 30, 0]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 blob-shape opacity-5"
      />
      
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [360, 270, 180, 90, 0],
          x: [0, -40, 0, 40, 0],
          y: [0, 40, 0, -40, 0]
        }}
        transition={{ 
          duration: 35, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/2 right-1/4 w-80 h-80 opacity-5"
        style={{ 
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'linear-gradient(135deg, #4A465F 0%, #6FB7B4 100%)'
        }}
      />
      
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, -45, -90, -135, -180],
          x: [0, 30, 0, -30, 0],
          y: [0, -50, 0, 50, 0]
        }}
        transition={{ 
          duration: 40, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/4 left-1/3 w-72 h-72 opacity-5"
        style={{ 
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'linear-gradient(135deg, #5EC2B7 0%, #A8DAD6 100%)'
        }}
      />

      {/* Smaller floating elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -20, 0, 20, 0],
            x: [0, 10, 0, -10, 0],
            scale: [1, 1.1, 1, 0.9, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8 + i * 2, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
          className="absolute w-16 h-16 rounded-full opacity-10"
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${20 + (i * 8)}%`,
            background: `linear-gradient(135deg, ${
              i % 3 === 0 ? '#A8DAD6' : 
              i % 3 === 1 ? '#6FB7B4' : '#5EC2B7'
            } 0%, ${
              i % 3 === 0 ? '#6FB7B4' : 
              i % 3 === 1 ? '#5EC2B7' : '#4A465F'
            } 100%)`,
            borderRadius: i % 2 === 0 ? '50%' : '30% 70% 70% 30% / 30% 30% 70% 70%'
          }}
        />
      ))}

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-secondary/5 opacity-50" />
    </div>
  )
}