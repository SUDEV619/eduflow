
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface FocusTimerProps {
  currentSession: any
  onComplete: (minutes: number, type: string) => void
}

const timerModes = [
  { id: 'pomodoro', name: 'Pomodoro', duration: 25 * 60, color: 'from-[#6FB7B4] to-[#5EC2B7]' },
  { id: 'short_break', name: 'Short Break', duration: 5 * 60, color: 'from-[#5EC2B7] to-[#A8DAD6]' },
  { id: 'long_break', name: 'Long Break', duration: 15 * 60, color: 'from-[#A8DAD6] to-[#6FB7B4]' },
  { id: 'custom', name: 'Custom', duration: 30 * 60, color: 'from-[#4A465F] to-[#6FB7B4]' },
]

export default function FocusTimer({ currentSession, onComplete }: FocusTimerProps) {
  const [selectedMode, setSelectedMode] = useState(0)
  const [time, setTime] = useState(timerModes[0].duration)
  const [initialTime, setInitialTime] = useState(timerModes[0].duration)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [customTime, setCustomTime] = useState(30)
  const [error, setError] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0 && isActive) {
      setIsActive(false)
      setIsPaused(false)
      // Timer completed
      const durationMinutes = Math.floor(initialTime / 60)
      onComplete(durationMinutes, timerModes[selectedMode].id)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, isPaused, time, initialTime, onComplete, selectedMode])

  const handleStart = () => {
    if (!currentSession.subject) {
      setError('Please select a subject before starting the session')
      setTimeout(() => setError(''), 3000)
      return
    }
    setIsActive(true)
    setIsPaused(false)
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    if (confirm('Are you sure you want to stop and save the current progress?')) {
      setIsActive(false)
      setIsPaused(false)
      const elapsedSeconds = initialTime - time
      const elapsedMinutes = Math.floor(elapsedSeconds / 60)
      if (elapsedMinutes > 0) {
        onComplete(elapsedMinutes, timerModes[selectedMode].id)
        toast.success(`Session stopped and progress saved! 🎯`, {
          style: {
            background: '#F5F5F5',
            color: '#4A465F',
            border: '1px solid #6FB7B4',
            fontWeight: 'bold',
          }
        })
      } else {
        toast.error("Session too short to save.", {
          style: {
            background: '#F5F5F5',
            color: '#F43F5E',
            border: '1px solid #F43F5E',
            fontWeight: 'bold',
          }
        })
      }
      setTime(initialTime)
    }
  }

  const handleReset = () => {
    setIsActive(false)
    setIsPaused(false)
    setTime(initialTime)
  }

  const handleModeChange = (index: number) => {
    if (!isActive) {
      setSelectedMode(index)
      const newTime = index === 3 ? customTime * 60 : timerModes[index].duration
      setTime(newTime)
      setInitialTime(newTime)
    }
  }

  const handleCustomTimeChange = (minutes: number) => {
    const mins = Math.max(1, Math.min(120, minutes))
    setCustomTime(mins)
    if (selectedMode === 3 && !isActive) {
      const newTime = mins * 60
      setTime(newTime)
      setInitialTime(newTime)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((initialTime - time) / initialTime) * 100
  const circumference = 2 * Math.PI * 120

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#4A465F]/5 relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5EC2B7]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4A465F]/5 rounded-full blur-3xl -ml-24 -mb-24" />

        <div className="text-center space-y-10 relative z-10">
          {/* Mode Selector */}
          <div className="flex flex-wrap justify-center gap-3">
            {timerModes.map((mode, index) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(index)}
                disabled={isActive}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selectedMode === index
                    ? `bg-[#4A465F] text-white shadow-lg shadow-[#4A465F]/20`
                    : 'bg-[#F5F5F5] text-[#4A465F]/40 hover:text-[#4A465F] hover:bg-[#F5F5F5]/80'
                } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {mode.name}
              </button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center gap-2 text-rose-500 font-bold text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Custom Time Input */}
          {selectedMode === 3 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-center space-x-3"
            >
              <Clock className="w-5 h-5 text-[#4A465F]/30" />
              <input
                type="number"
                value={customTime}
                onChange={(e) => handleCustomTimeChange(parseInt(e.target.value) || 30)}
                className="w-20 px-4 py-2 bg-[#F5F5F5] rounded-xl text-center font-bold text-[#4A465F] focus:outline-none focus:ring-2 ring-[#5EC2B7]/20"
                min="1"
                max="120"
                disabled={isActive}
              />
              <span className="text-[#4A465F]/40 font-bold text-sm uppercase tracking-widest">minutes</span>
            </motion.div>
          )}

          {/* Timer Display */}
          <div className="relative w-72 h-72 mx-auto">
            <svg className="w-72 h-72 transform -rotate-90" viewBox="0 0 280 280">
              <circle
                cx="140"
                cy="140"
                r="120"
                stroke="#F5F5F5"
                strokeWidth="10"
                fill="none"
              />
              <motion.circle
                cx="140"
                cy="140"
                r="120"
                stroke={selectedMode === 3 ? "#4A465F" : "#5EC2B7"}
                strokeWidth="10"
                fill="none"
                strokeDasharray={circumference}
                animate={{ 
                  strokeDashoffset: circumference - (progress / 100) * circumference 
                }}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-black text-[#4A465F] tracking-tighter">
                  {formatTime(time)}
                </div>
                <div className="text-xs font-black text-[#4A465F]/30 uppercase tracking-widest mt-2">
                  {isActive && !isPaused ? 'Focusing...' : isPaused ? 'Paused' : 'Ready'}
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!isActive ? (
              <motion.button
                onClick={handleStart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-10 py-4 bg-[#5EC2B7] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#5EC2B7]/20 hover:bg-[#4DB0A6] transition-all"
              >
                <Play className="w-6 h-6 fill-current" />
                Start Session
              </motion.button>
            ) : (
              <motion.button
                onClick={handlePause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 px-10 py-4 bg-[#4A465F] text-white rounded-2xl font-black text-lg shadow-xl shadow-[#4A465F]/20 transition-all"
              >
                {isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                {isPaused ? 'Resume' : 'Pause'}
              </motion.button>
            )}

            <button
              onClick={handleStop}
              disabled={!isActive}
              className="p-4 bg-[#F5F5F5] text-[#4A465F]/40 rounded-2xl hover:text-[#4A465F] transition-all disabled:opacity-30"
            >
              <Square className="w-6 h-6 fill-current" />
            </button>

            <button
              onClick={handleReset}
              className="p-4 bg-[#F5F5F5] text-[#4A465F]/40 rounded-2xl hover:text-[#4A465F] transition-all"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
