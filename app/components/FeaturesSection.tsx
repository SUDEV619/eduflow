'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: '📊',
    title: 'Study Tracking',
    description: 'Monitor your learning progress with detailed analytics and insights that help you stay on track.',
  },
  {
    icon: '📈',
    title: 'Analytics Dashboard',
    description: 'Visualize your performance with beautiful charts and personalized recommendations.',
  },
  {
    icon: '🎯',
    title: 'Mock Tests',
    description: 'Practice with realistic exams and get instant feedback to improve your performance.',
  },
  {
    icon: '👥',
    title: 'Study Circles',
    description: 'Connect with peers, share knowledge, and learn together in collaborative groups.',
  },
  {
    icon: '🏆',
    title: 'Public Progress',
    description: 'Share your achievements and inspire others while building your learning reputation.',
  },
  {
    icon: '⚡',
    title: 'Smart Reminders',
    description: 'Never miss a study session with intelligent notifications tailored to your schedule.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white/50">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-text mb-6">
            Everything You Need to{' '}
            <span className="text-accent">Excel</span>
          </h2>
          <p className="text-xl text-text/70 max-w-3xl mx-auto">
            Powerful features designed to transform your study habits and accelerate your learning journey.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ 
                y: -10, 
                rotateY: 5,
                scale: 1.02
              }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 h-full">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl mb-6 inline-block"
                >
                  {feature.icon}
                </motion.div>
                
                <h3 className="text-xl font-semibold text-text mb-4 group-hover:text-accent transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-text/70 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}