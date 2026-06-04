'use client'

import { motion } from 'framer-motion'

export default function AboutSection() {
  const values = [
    {
      icon: '🎯',
      title: 'Focus-Driven',
      description: 'We believe in the power of focused, intentional learning that leads to real results.'
    },
    {
      icon: '🌱',
      title: 'Growth Mindset',
      description: 'Every challenge is an opportunity to grow. We support your journey from beginner to expert.'
    },
    {
      icon: '🤝',
      title: 'Community First',
      description: 'Learning is better together. Connect with peers who share your passion for growth.'
    },
    {
      icon: '📊',
      title: 'Data-Informed',
      description: 'Make smarter study decisions with insights backed by your personal learning analytics.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-background to-secondary/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 blob-shape opacity-5" />
      <div className="absolute bottom-20 left-20 w-80 h-80 opacity-5" style={{ 
        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
        background: 'linear-gradient(135deg, #4A465F 0%, #6FB7B4 100%)'
      }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-text mb-6">
            About{' '}
            <span className="text-accent">EduFlow</span>
          </h2>
          <p className="text-xl text-text/70 max-w-4xl mx-auto leading-relaxed">
            We're on a mission to transform how students learn, study, and achieve their academic goals. 
            EduFlow combines cutting-edge technology with proven learning methodologies to create 
            a personalized education experience that adapts to your unique learning style.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-3xl font-bold text-text mb-6">
                Empowering Students Worldwide
              </h3>
              <p className="text-lg text-text/70 leading-relaxed mb-6">
                Founded by educators and technologists who understand the challenges of modern learning, 
                EduFlow was born from a simple belief: every student deserves access to tools that make 
                learning more effective, engaging, and enjoyable.
              </p>
              <p className="text-lg text-text/70 leading-relaxed">
                Our platform combines intelligent analytics, collaborative features, and personalized 
                study plans to help you achieve your academic dreams faster than ever before.
              </p>
            </div>

            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">50K+</div>
                <div className="text-text/60">Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">95%</div>
                <div className="text-text/60">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">2M+</div>
                <div className="text-text/60">Study Hours</div>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-button rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">Our Mission</h4>
                    <p className="text-text/70 text-sm">Democratize quality education for all</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-button to-secondary rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">👁️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">Our Vision</h4>
                    <p className="text-text/70 text-sm">A world where learning knows no boundaries</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-hero rounded-2xl flex items-center justify-center">
                    <span className="text-white text-xl">💎</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text">Our Promise</h4>
                    <p className="text-text/70 text-sm">Personalized learning that adapts to you</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold text-text mb-4">
            Our Core Values
          </h3>
          <p className="text-lg text-text/70 max-w-2xl mx-auto">
            These principles guide everything we do and shape the EduFlow experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="text-center group"
            >
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 h-full">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                  className="text-4xl mb-4 inline-block"
                >
                  {value.icon}
                </motion.div>
                
                <h4 className="text-lg font-semibold text-text mb-3 group-hover:text-accent transition-colors duration-300">
                  {value.title}
                </h4>
                
                <p className="text-text/70 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}