'use client'

import { motion } from 'framer-motion'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import WaveTransition from './components/WaveTransition'
import FeaturesSection from './components/FeaturesSection'
import AboutSection from './components/AboutSection'
import InteractiveSection from './components/InteractiveSection'
import MotivationSection from './components/MotivationSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import BackgroundBlobs from './components/BackgroundBlobs'

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <BackgroundBlobs />
      <Navbar />
      <HeroSection />
      <WaveTransition />
      <FeaturesSection />
      <AboutSection />
      <InteractiveSection />
      <MotivationSection />
      <CTASection />
      <Footer />
    </main>
  )
}