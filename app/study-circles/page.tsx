'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Sidebar from '../dashboard/components/Sidebar'
import TopNavbar from '../dashboard/components/TopNavbar'
import StudyCirclesOverview from './components/StudyCirclesOverview'
import CreateJoinSection from './components/CreateJoinSection'
import CircleDetailPage from './components/CircleDetailPage'
import StudyCirclesBackground from './components/StudyCirclesBackground'

export default function StudyCirclesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCircle, setSelectedCircle] = useState<number | null>(null)
  const [currentView, setCurrentView] = useState<'overview' | 'create' | 'join' | 'detail'>('overview')

  const handleCircleSelect = (circleId: number) => {
    setSelectedCircle(circleId)
    setCurrentView('detail')
  }

  const handleBackToOverview = () => {
    setSelectedCircle(null)
    setCurrentView('overview')
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StudyCirclesBackground />
      
      <div className="flex">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <TopNavbar />
          
          <AnimatePresence mode="wait">
            {currentView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6 space-y-8"
              >
                <StudyCirclesOverview 
                  onCircleSelect={handleCircleSelect}
                  onCreateClick={() => setCurrentView('create')}
                  onJoinClick={() => setCurrentView('join')}
                />
              </motion.div>
            )}

            {currentView === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                <CreateJoinSection 
                  mode="create"
                  onBack={() => setCurrentView('overview')}
                />
              </motion.div>
            )}

            {currentView === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                <CreateJoinSection 
                  mode="join"
                  onBack={() => setCurrentView('overview')}
                  onCircleSelect={handleCircleSelect}
                />
              </motion.div>
            )}

            {currentView === 'detail' && selectedCircle && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="p-6"
              >
                <CircleDetailPage 
                  circleId={selectedCircle}
                  onBack={handleBackToOverview}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
