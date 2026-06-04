'use client'

import { motion } from 'framer-motion'

export default function AuthIllustration() {
  return (
    <div className="relative w-full max-w-lg h-96 flex items-center justify-center">
      {/* Central Laptop Device */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative z-10"
      >
        <motion.div
          animate={{ y: [-10, 10, -10], rotateY: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-40 h-28 bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl relative shadow-2xl"
        >
          {/* Screen */}
          <div className="w-36 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl absolute top-1 left-2">
            {/* Dashboard Content */}
            <div className="w-32 h-20 bg-gradient-to-br from-accent to-button rounded-xl absolute top-2 left-2 opacity-90 p-2">
              {/* Mini Dashboard Elements */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-2 bg-white/70 rounded" />
                  <div className="w-4 h-2 bg-white/50 rounded" />
                </div>
                <div className="w-full h-1 bg-white/30 rounded" />
                <div className="flex space-x-1">
                  <div className="w-6 h-3 bg-white/60 rounded" />
                  <div className="w-4 h-3 bg-white/40 rounded" />
                  <div className="w-8 h-3 bg-white/60 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="w-3 h-3 bg-white/50 rounded-full" />
                  <div className="w-3 h-3 bg-white/70 rounded-full" />
                  <div className="w-3 h-3 bg-white/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
          {/* Keyboard */}
          <div className="absolute bottom-1 left-2 w-36 h-3 bg-gray-600 rounded-lg" />
        </motion.div>
      </motion.div>

      {/* Tablet Device */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute top-16 left-8 z-10"
      >
        <motion.div
          animate={{ 
            y: [-8, 8, -8],
            rotate: [-3, 3, -3]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="w-20 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl shadow-xl relative"
        >
          <div className="w-18 h-26 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl absolute top-1 left-1">
            <div className="w-16 h-24 bg-gradient-to-br from-secondary to-accent rounded-lg absolute top-1 left-1 p-2">
              {/* Notes Interface */}
              <div className="space-y-1">
                <div className="w-12 h-1 bg-white/60 rounded" />
                <div className="w-8 h-1 bg-white/40 rounded" />
                <div className="w-14 h-1 bg-white/60 rounded" />
                <div className="w-6 h-1 bg-white/40 rounded" />
                <div className="w-10 h-1 bg-white/50 rounded" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Study Elements */}
      <motion.div
        animate={{ 
          y: [-15, 15, -15],
          rotate: [0, 10, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-8 left-16 w-18 h-18 bg-gradient-to-br from-accent to-button rounded-3xl flex items-center justify-center shadow-xl z-10"
      >
        <span className="text-3xl">⏱️</span>
      </motion.div>

      <motion.div
        animate={{ 
          y: [15, -15, 15],
          rotate: [0, -8, 0]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute top-12 right-12 w-20 h-20 bg-gradient-to-br from-secondary to-accent rounded-3xl flex items-center justify-center shadow-xl z-10"
      >
        <span className="text-4xl">📊</span>
      </motion.div>

      <motion.div
        animate={{ 
          y: [-12, 12, -12],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute bottom-20 left-12 w-16 h-16 bg-gradient-to-br from-button to-secondary rounded-2xl flex items-center justify-center shadow-xl z-10"
      >
        <span className="text-2xl">📝</span>
      </motion.div>

      <motion.div
        animate={{ 
          y: [12, -12, 12],
          rotate: [0, -6, 0]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute bottom-16 right-16 w-22 h-22 bg-gradient-to-br from-hero to-accent rounded-3xl flex items-center justify-center shadow-xl z-10"
      >
        {/* Progress Ring */}
        <div className="relative w-14 h-14">
          <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="24"
              stroke="white"
              strokeWidth="3"
              fill="none"
              opacity="0.3"
            />
            <motion.circle
              cx="28"
              cy="28"
              r="24"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 24}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 24 * 0.25 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-sm font-bold">85%</span>
          </div>
        </div>
      </motion.div>

      {/* Additional Study Tools */}
      <motion.div
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 8, 0]
        }}
        transition={{ 
          duration: 9, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3
        }}
        className="absolute top-32 right-8 w-14 h-14 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center shadow-xl z-10"
      >
        <span className="text-xl">🎯</span>
      </motion.div>

      <motion.div
        animate={{ 
          y: [8, -8, 8],
          rotate: [0, -4, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
        className="absolute bottom-32 left-20 w-12 h-12 bg-gradient-to-br from-button to-hero rounded-xl flex items-center justify-center shadow-xl z-10"
      >
        <span className="text-lg">📚</span>
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-5">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -40, 0],
              x: [0, Math.sin(i) * 25, 0],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 5 + i * 0.7, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.4
            }}
            className="absolute w-4 h-4 bg-white rounded-full"
            style={{
              left: `${10 + (i * 6)}%`,
              top: `${15 + (i * 5)}%`,
            }}
          />
        ))}
      </div>

      {/* Central Focus Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5"
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-32 h-32 border-4 border-white/20 rounded-full relative"
        >
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-2 left-2 w-4 h-4 bg-accent rounded-full"
          />
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-4 right-4 w-3 h-3 bg-button rounded-full"
          />
          <motion.div
            animate={{ rotate: [0, -360] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-8 right-2 w-2 h-2 bg-secondary rounded-full"
          />
        </motion.div>
      </motion.div>

    </div>
  )
}