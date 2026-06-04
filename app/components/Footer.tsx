'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  const socialLinks = [
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
    { name: 'Instagram', icon: '📸', href: '#' },
    { name: 'Discord', icon: '💬', href: '#' },
  ]

  const footerLinks = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Analytics', 'Study Tools']
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Contact']
    },
    {
      title: 'Resources',
      links: ['Help Center', 'Community', 'Study Guides', 'API Docs']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Security', 'Cookies']
    }
  ]

  return (
    <footer className="bg-white/50 backdrop-blur-sm border-t border-white/20">
      {/* Soft divider wave */}
      <div className="relative h-16 overflow-hidden">
        <svg
          className="absolute top-0 w-full h-full"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C300,10 900,50 1200,30 L1200,0 L0,0 Z"
            fill="url(#footerGradient)"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="footerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A8DAD6" />
              <stop offset="50%" stopColor="#6FB7B4" />
              <stop offset="100%" stopColor="#5EC2B7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-6 gap-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="text-3xl font-bold text-hero">EduFlow</div>
            <p className="text-text/70 leading-relaxed max-w-md">
              Empowering students worldwide to achieve their academic dreams through 
              intelligent study tools and supportive community.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.2, 
                    y: -3,
                    rotate: 10
                  }}
                  className="w-12 h-12 bg-gradient-to-br from-accent to-button rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="text-lg">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-text text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                  >
                    <a
                      href="#"
                      className="text-text/70 hover:text-accent transition-colors duration-300 hover:underline"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div className="text-text/60 text-sm">
            © 2024 EduFlow. All rights reserved. Made with ❤️ for learners worldwide.
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-text/60">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              All systems operational
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}