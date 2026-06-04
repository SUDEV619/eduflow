'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw } from 'lucide-react'

export default function StudyTracker() {
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [initialTime] = useState(25 * 60)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0) {
      setIsActive(false)
      setIsPaused(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, isPaused, time])

  const handleStart = () => {
    setIsActive(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleReset = () => {
    setIsActive(false)
    setIsPaused(false)
    setTime(initialTime)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((initialTime - time) / initialTime) * 100
  const circumference = 2 * Math.PI * 90

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
    >
      <div className="text-center space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-text mb-2">Study Timer</h3>
          <p className="text-text/60 text-sm">Pomodoro Focus Session</p>
        </div>

        {/* Circular Progress */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (progress / 100) * circumference}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              initial={{ strokeDashoffset: circumference }}
              animate={{ 
                strokeDashoffset: circumference - (progress / 100) * circumference 
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6FB7B4" />
                <stop offset="100%" stopColor="#5EC2B7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                key={time}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={`text-4xl font-bold ${
                  isActive && !isPaused ? 'text-accent' : 'text-text'
                }`}
              >
                {formatTime(time)}
              </motion.div>
              <div className="text-sm text-text/60 mt-1">
                {isActive && !isPaused ? 'Studying...' : 'Ready to focus'}
              </div>
            </div>
          </div>

          {/* Pulse Effect */}
          {isActive && !isPaused && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-accent/30"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {!isActive ? (
            <motion.button
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent to-button text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              <span>Start</span>
            </motion.button>
          ) : (
            <motion.button
              onClick={handlePause}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </motion.button>
          )}

          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 bg-white/50 border border-gray-200 rounded-2xl hover:bg-white/70 transition-all duration-300"
          >
            <RotateCcw className="w-5 h-5 text-text/70" />
          </motion.button>
        </div>

        {/* Session Info */}
        <div className="flex items-center justify-between text-sm text-text/60 bg-gray-50/50 rounded-2xl p-3">
          <span>Session: 1/4</span>
          <span>Break: 5 min</span>
        </div>
      </div>
    </motion.div>
  )
}