'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    quote: "EduFlow transformed my study routine. I went from struggling to achieving my dream score!",
    author: "Sarah Chen",
    role: "Medical Student",
    avatar: "👩‍⚕️"
  },
  {
    quote: "The analytics helped me identify my weak spots and focus my energy where it mattered most.",
    author: "Marcus Johnson",
    role: "Engineering Student",
    avatar: "👨‍💻"
  },
  {
    quote: "Study circles connected me with amazing peers. We motivated each other to reach new heights.",
    author: "Priya Patel",
    role: "Law Student",
    avatar: "👩‍💼"
  }
]

const achievements = [
  { number: "50K+", label: "Active Students", icon: "👥" },
  { number: "2M+", label: "Study Hours", icon: "⏱️" },
  { number: "95%", label: "Success Rate", icon: "🎯" },
  { number: "4.9★", label: "User Rating", icon: "⭐" }
]

export default function MotivationSection() {
  return (
    <section className="py-20 bg-white/30 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-10 left-10 w-32 h-32 blob-shape opacity-20 animate-blob" />
      <div className="absolute bottom-10 right-10 w-40 h-40 blob-shape opacity-15 animate-blob" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-text mb-6">
            Join Thousands of{' '}
            <span className="text-accent">Successful Learners</span>
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="text-3xl lg:text-4xl font-bold text-text mb-2">
                  {achievement.number}
                </div>
                <div className="text-text/70 font-medium">{achievement.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center text-text mb-12">
            What Our Students Say
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20"
              >
                <div className="text-4xl mb-4 text-center">{testimonial.avatar}</div>
                <blockquote className="text-text/80 italic mb-6 text-center leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-center">
                  <div className="font-semibold text-text">{testimonial.author}</div>
                  <div className="text-accent text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-gradient-to-r from-accent/10 to-button/10 rounded-3xl p-12 border border-accent/20"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-6xl mb-6"
          >
            💡
          </motion.div>
          <blockquote className="text-2xl lg:text-3xl font-bold text-text mb-4 leading-relaxed">
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
          </blockquote>
          <cite className="text-accent font-medium">— Winston Churchill</cite>
        </motion.div>
      </div>
    </section>
  )
}