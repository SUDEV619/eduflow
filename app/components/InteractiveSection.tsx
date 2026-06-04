'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

export default function InteractiveSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [studyHours, setStudyHours] = useState(0)
  const [completedTests, setCompletedTests] = useState(0)
  const [accuracy, setAccuracy] = useState(0)

  useEffect(() => {
    if (isInView) {
      const timer1 = setTimeout(() => {
        const interval1 = setInterval(() => {
          setStudyHours(prev => {
            if (prev >= 247) {
              clearInterval(interval1)
              return 247
            }
            return prev + 5
          })
        }, 20)
      }, 500)

      const timer2 = setTimeout(() => {
        const interval2 = setInterval(() => {
          setCompletedTests(prev => {
            if (prev >= 89) {
              clearInterval(interval2)
              return 89
            }
            return prev + 2
          })
        }, 30)
      }, 800)

      const timer3 = setTimeout(() => {
        const interval3 = setInterval(() => {
          setAccuracy(prev => {
            if (prev >= 94) {
              clearInterval(interval3)
              return 94
            }
            return prev + 1
          })
        }, 40)
      }, 1200)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isInView])

  return (
    <section className="py-20 bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-text mb-6">
            Your Learning{' '}
            <span className="text-accent">Dashboard</span>
          </h2>
          <p className="text-xl text-text/70 max-w-3xl mx-auto">
            Track your progress with beautiful, intuitive analytics that motivate and guide your learning journey.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Dashboard UI Mockup */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-text">Study Analytics</h3>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-accent to-button p-4 rounded-2xl text-white text-center">
                  <div className="text-2xl font-bold">{studyHours}</div>
                  <div className="text-sm opacity-90">Hours</div>
                </div>
                <div className="bg-gradient-to-br from-button to-secondary p-4 rounded-2xl text-white text-center">
                  <div className="text-2xl font-bold">{completedTests}</div>
                  <div className="text-sm opacity-90">Tests</div>
                </div>
                <div className="bg-gradient-to-br from-secondary to-accent p-4 rounded-2xl text-white text-center">
                  <div className="text-2xl font-bold">{accuracy}%</div>
                  <div className="text-sm opacity-90">Accuracy</div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-end justify-between h-32 space-x-2">
                  {[65, 78, 45, 89, 67, 92, 78].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={isInView ? { height: `${height}%` } : { height: 0 }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="bg-gradient-to-t from-accent to-button rounded-t-lg flex-1 min-w-0"
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-text/60 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </div>

              {/* Subject Distribution */}
              <div className="space-y-3">
                {[
                  { subject: 'Mathematics', progress: 85, color: 'bg-accent' },
                  { subject: 'Physics', progress: 72, color: 'bg-button' },
                  { subject: 'Chemistry', progress: 91, color: 'bg-secondary' },
                ].map((item, index) => (
                  <div key={item.subject} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text font-medium">{item.subject}</span>
                      <span className="text-text/70">{item.progress}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${item.progress}%` } : { width: 0 }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
                        className={`h-2 rounded-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-text mb-4">
                Data-Driven Learning
              </h3>
              <p className="text-lg text-text/70 leading-relaxed">
                Transform raw study time into meaningful insights. Our analytics help you identify 
                patterns, optimize your schedule, and focus on areas that need the most attention.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: '📊',
                  title: 'Performance Tracking',
                  description: 'Monitor your progress across all subjects with detailed breakdowns.'
                },
                {
                  icon: '🎯',
                  title: 'Goal Setting',
                  description: 'Set and track personalized learning goals with milestone celebrations.'
                },
                {
                  icon: '🔍',
                  title: 'Weakness Analysis',
                  description: 'Identify knowledge gaps and get targeted practice recommendations.'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-semibold text-text mb-2">{feature.title}</h4>
                    <p className="text-text/70">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}