'use client'

import { motion } from 'framer-motion'

export default function CTASection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background with gradient and shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-hero/5 to-accent/10" />
      
      {/* Floating background shapes */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-10 left-10 w-64 h-64 blob-shape opacity-10"
      />
      
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-10 right-10 w-80 h-80 blob-shape opacity-10"
        style={{ 
          borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%',
          background: 'linear-gradient(135deg, #4A465F 0%, #5EC2B7 100%)'
        }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl mb-8"
          >
            🚀
          </motion.div>

          <h2 className="text-4xl lg:text-6xl font-bold text-text leading-tight">
            Stay Consistent.{' '}
            <span className="text-accent">Stay Ahead.</span>
          </h2>
          
          <p className="text-xl lg:text-2xl text-text/70 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who have transformed their learning journey. 
            Your future self will thank you for starting today.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
          >
              <motion.a
                href="/dashboard"
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  boxShadow: "0 20px 40px rgba(94, 194, 183, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-gradient-to-r from-button to-accent text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group inline-block text-center"
              >
                <span className="relative z-10">Start Your Journey</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-accent to-button opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                borderColor: '#5EC2B7'
              }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 border-3 border-accent text-accent rounded-2xl font-bold text-xl hover:bg-accent hover:text-white transition-all duration-300"
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12 text-text/60"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="font-medium">Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="font-medium">Setup in 2 minutes</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}