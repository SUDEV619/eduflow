'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import AuthIllustration from './components/AuthIllustration'
import SignInForm from './components/SignInForm'
import SignUpForm from './components/SignUpForm'
import AuthBackground from './components/AuthBackground'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <AuthBackground />
      
      {/* Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-50 p-6"
      >
        <div className="flex items-center justify-between">
          {/* Back to Home Link */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 text-text/70 hover:text-accent transition-all duration-300 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/30"
          >
            <motion.span 
              className="text-xl"
              whileHover={{ x: -3 }}
              transition={{ duration: 0.2 }}
            >
              ←
            </motion.span>
            <span className="font-medium">Back to EduFlow</span>
          </motion.a>

          {/* EduFlow Logo */}
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-bold text-hero hover:text-accent transition-colors duration-300"
          >
            EduFlow
          </motion.a>
        </div>
      </motion.div>

      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left Side - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-gradient-to-br from-hero to-accent/20 flex items-center justify-center p-8 lg:p-16"
        >
          {/* Background Shapes */}
          <div className="absolute inset-0 overflow-hidden">
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
              className="absolute top-10 left-10 w-64 h-64 blob-shape opacity-20"
              style={{ background: 'linear-gradient(135deg, #A8DAD6 0%, #6FB7B4 100%)' }}
            />
            
            <motion.div
              animate={{ 
                scale: [1.1, 1, 1.1],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 10, 
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute bottom-20 right-10 w-48 h-48 opacity-15"
              style={{ 
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                background: 'linear-gradient(135deg, #5EC2B7 0%, #A8DAD6 100%)'
              }}
            />
          </div>

          <AuthIllustration />
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="flex items-center justify-center p-8 lg:p-16 relative"
        >
          <div className="w-full max-w-md">
            {/* Form Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="flex bg-white/50 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                <motion.button
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    !isSignUp 
                      ? 'bg-white text-text shadow-lg' 
                      : 'text-text/60 hover:text-text'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    isSignUp 
                      ? 'bg-white text-text shadow-lg' 
                      : 'text-text/60 hover:text-text'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                </motion.button>
              </div>
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20"
            >
              {/* Welcome Text */}
              <motion.div
                key={isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-8"
              >
                <h1 className="text-3xl font-bold text-text mb-2">
                  {isSignUp ? 'Join EduFlow' : 'Welcome Back'}
                </h1>
                <p className="text-text/70">
                  {isSignUp 
                    ? 'Start your learning journey today' 
                    : 'Continue your learning journey'
                  }
                </p>
              </motion.div>

              {/* Form */}
              <motion.div
                key={isSignUp ? 'signup-form' : 'signin-form'}
                initial={{ opacity: 0, x: isSignUp ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isSignUp ? -20 : 20 }}
                transition={{ duration: 0.4 }}
              >
                {isSignUp ? <SignUpForm /> : <SignInForm />}
              </motion.div>
            </motion.div>

            {/* Footer Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-text/60 text-sm mt-6 space-y-3"
            >
              <p>
                By continuing, you agree to our{' '}
                <a href="#" className="text-accent hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-accent hover:underline">Privacy Policy</a>
              </p>
              
              {/* Additional Navigation */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="pt-2"
              >
                <a
                  href="/"
                  className="inline-flex items-center space-x-2 text-accent hover:text-accent/80 transition-colors duration-300 font-medium"
                >
                  <span>← Return to Homepage</span>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}