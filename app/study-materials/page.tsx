'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, Book, Flame, Clock, Star, 
  Loader2, BookOpen, X, ChevronRight 
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import Sidebar from '../dashboard/components/Sidebar'
import TopNavbar from '../dashboard/components/TopNavbar'
import DashboardBackground from '../dashboard/components/DashboardBackground'
import ProtectedRoute from '../components/ProtectedRoute'
import { studyMaterialApi, StudyMaterial } from './services/api'
import MaterialCard from './components/MaterialCard'

// ─── Toast Container ─────────────────────────────────────────────────────────

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

let toastIdCounter = 0

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-sm font-bold min-w-[300px] ${
              t.type === 'success'
                ? 'bg-white border-[#5EC2B7]/20 text-[#5EC2B7]'
                : 'bg-white border-rose-100 text-rose-500'
            }`}
          >
            <span className="flex-1">{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="opacity-40 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'all', label: 'All Resources', icon: BookOpen },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'favorites', label: 'Favorites', icon: Star },
]

const SUBJECTS = [
  { value: "all", label: "All Subjects" },
  { value: "quantitative_aptitude", label: "Quant" },
  { value: "general_reasoning", label: "Reasoning" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "polity", label: "Polity" },
  { value: "economy", label: "Economy" },
  { value: "general_science", label: "Science" },
  { value: "current_affairs", label: "Current Affairs" },
]

export default function StudyMaterialsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true)
      const response = await studyMaterialApi.getMaterials(activeTab, selectedSubject, searchTerm)
      if (response.status === 'success') {
        setMaterials(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch materials:', error)
      addToast('error', 'Failed to load resources. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [activeTab, selectedSubject, searchTerm, addToast])

  useEffect(() => {
    fetchMaterials()
  }, [activeTab, selectedSubject, searchTerm, fetchMaterials])

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleDownload = async (id: number) => {
    try {
      const response = await studyMaterialApi.downloadMaterial(id)
      if (response.status === 'success') {
        window.open(`http://127.0.0.1:8000${response.file}`, '_blank')
        addToast('success', 'Download started successfully!')
      }
    } catch (error) {
      addToast('error', 'Failed to start download.')
    }
  }

  const handleToggleFavorite = async (id: number) => {
    try {
      const response = await studyMaterialApi.toggleFavorite(id)
      if (response.status === 'success') {
        addToast('success', response.action === 'added' ? 'Added to favorites ⭐' : 'Removed from favorites')
        if (activeTab === 'favorites' && response.action === 'removed') {
          setMaterials(prev => prev.filter(m => m.id !== id))
        }
      }
    } catch (error) {
      addToast('error', 'Action failed.')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <DashboardBackground />
        <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

        <div className="flex">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
          
          <div className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}>
            <TopNavbar />
            
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 space-y-8 max-w-7xl mx-auto"
            >
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#5EC2B7] font-black text-xs uppercase tracking-[0.2em]">
                    <Book className="w-4 h-4" />
                    Knowledge Hub
                  </div>
                  <h1 className="text-4xl font-black text-[#4A465F] tracking-tighter">
                    Study <span className="text-[#5EC2B7]">Materials</span>
                  </h1>
                  <p className="text-[#4A465F]/40 font-bold text-sm">
                    Curated resources to accelerate your learning journey
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A465F]/20 group-focus-within:text-[#5EC2B7] transition-colors" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      className="pl-12 pr-6 py-4 bg-white border border-[#4A465F]/5 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-[#5EC2B7]/10 w-full md:w-80 text-sm font-bold text-[#4A465F] placeholder:font-medium shadow-sm group-hover:shadow-md transition-all"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tabs and Filters */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#4A465F]/5 pb-1 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-8">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 pb-4 px-1 text-sm font-black transition-all relative ${
                          activeTab === tab.id 
                            ? 'text-[#5EC2B7]' 
                            : 'text-[#4A465F]/30 hover:text-[#4A465F]/60'
                        }`}
                      >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                        {tab.label}
                        {activeTab === tab.id && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-[#5EC2B7] rounded-full"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="p-2 bg-white rounded-2xl border border-[#4A465F]/5 flex items-center gap-2 shadow-sm">
                    <Filter className="w-4 h-4 text-[#4A465F]/30 ml-2" />
                    <div className="h-4 w-[1px] bg-[#4A465F]/10 mx-1" />
                    {SUBJECTS.map((sub) => (
                      <button
                        key={sub.value}
                        onClick={() => setSelectedSubject(sub.value)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          selectedSubject === sub.value
                            ? 'bg-[#5EC2B7] text-white shadow-lg shadow-[#5EC2B7]/20'
                            : 'text-[#4A465F]/40 hover:bg-[#F5F5F5]'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="relative">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="w-12 h-12 text-[#5EC2B7] animate-spin" />
                    <p className="text-sm font-black text-[#4A465F]/30 uppercase tracking-widest animate-pulse">
                      Building resource grid...
                    </p>
                  </div>
                ) : materials.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    <AnimatePresence mode="popLayout">
                      {materials.map((m) => (
                        <MaterialCard
                          key={m.id}
                          material={m}
                          onDownload={handleDownload}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-32 text-center"
                  >
                    <div className="w-24 h-24 rounded-[2.5rem] bg-[#F5F5F5] flex items-center justify-center mb-6">
                      <BookOpen className="w-12 h-12 text-[#4A465F]/10" />
                    </div>
                    <h3 className="text-2xl font-black text-[#4A465F] mb-2">No Resources Found</h3>
                    <p className="text-sm text-[#4A465F]/40 font-bold max-w-xs mx-auto mb-8">
                      We couldn't find any materials matching your current filters. Try exploring other subjects or search terms!
                    </p>
                    <button
                      onClick={() => {
                        setActiveTab('all')
                        setSelectedSubject('all')
                        setSearchInput('')
                      }}
                      className="px-8 py-4 bg-[#5EC2B7] text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-[#5EC2B7]/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                      Clear All Filters
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
