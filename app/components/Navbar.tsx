'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  
  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
    return unsubscribe
  }, [scrollY])

  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ['rgba(245, 245, 245, 0)', 'rgba(245, 245, 245, 0.95)']
  )

  return (
    <motion.nav
      style={{ backgroundColor }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-hero"
          >
            EduFlow
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'About'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-text hover:text-accent transition-colors duration-300 font-medium"
              >
                {item}
              </motion.a>
            ))}
          </div>
          
          <motion.a
            href="/auth"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 border-2 border-hero text-hero rounded-full hover:bg-hero hover:text-white transition-all duration-300 font-medium"
          >
            Sign In
          </motion.a>
        </div>
      </div>
    </motion.nav>
  )
}