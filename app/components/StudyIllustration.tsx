'use client'

import { motion } from 'framer-motion'

export default function StudyIllustration() {
  return (
    <div className="relative w-full h-96 flex items-center justify-center">
      {/* Background Blobs */}
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-80 h-80 blob-shape opacity-20"
      />
      
      <motion.div
        animate={{ 
          scale: [1.1, 1, 1.1],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute w-60 h-60 blob-shape opacity-30"
        style={{ 
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'linear-gradient(135deg, #5EC2B7 0%, #A8DAD6 100%)'
        }}
      />

      {/* Main Character - Student */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10"
      >
        {/* Student Body */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
        >
          {/* Head */}
          <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full mx-auto mb-2" />
          
          {/* Body */}
          <div className="w-20 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl mx-auto relative">
            {/* Arms */}
            <div className="absolute -left-3 top-4 w-6 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full transform -rotate-12" />
            <div className="absolute -right-3 top-4 w-6 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full transform rotate-12" />
          </div>
          
          {/* Laptop */}
          <motion.div
            animate={{ rotateX: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg mx-auto mt-2 relative"
          >
            <div className="w-20 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-md absolute top-1 left-2" />
            <div className="w-16 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-sm absolute top-3 left-4 opacity-80" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating Study Elements */}
      <motion.div
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-8 left-8 w-12 h-12 bg-gradient-to-br from-accent to-button rounded-xl flex items-center justify-center shadow-lg"
      >
        <div className="text-white font-bold text-sm">⏱️</div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [10, -10, 10],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-16 right-12 w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center shadow-lg"
      >
        <div className="text-white font-bold text-lg">📊</div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [-8, 8, -8],
          rotate: [0, 3, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-12 left-16 w-10 h-10 bg-gradient-to-br from-button to-secondary rounded-full flex items-center justify-center shadow-lg"
      >
        <div className="text-white font-bold text-xs">📝</div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [8, -8, 8],
          rotate: [0, -3, 0]
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-hero to-accent rounded-2xl flex items-center justify-center shadow-lg"
      >
        <div className="w-8 h-8 border-4 border-white rounded-full border-t-transparent animate-spin" />
      </motion.div>

      {/* Dotted Pattern */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: i * 0.1
            }}
            className="absolute w-2 h-2 bg-accent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}