'use client'

import { motion } from 'framer-motion'
import StudyIllustration from './StudyIllustration'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Hero Background Blob */}
      <div className="absolute top-0 right-0 w-2/3 h-full hero-blob opacity-10 -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl lg:text-6xl font-bold text-text leading-tight"
          >
            Design Your Study.{' '}
            <span className="text-accent">Master Your Future.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl text-text/80 leading-relaxed max-w-lg"
          >
            Transform your learning journey with intelligent study tracking, 
            personalized analytics, and a supportive community that grows with you.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <motion.a
              href="/dashboard"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-button text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 inline-block text-center"
            >
              Get Started
            </motion.a>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-accent text-accent rounded-2xl font-semibold text-lg hover:bg-accent hover:text-white transition-all duration-300"
            >
              View Demo
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Right Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative"
        >
          <StudyIllustration />
        </motion.div>
      </div>
    </section>
  )
}