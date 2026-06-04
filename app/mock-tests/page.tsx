'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Clock, ClipboardList, Sparkles, Loader2, Filter, X } from 'lucide-react'
import MockTestsShell from './components/MockTestsShell'
import { type MockTestDifficulty } from './mockTestsData'
import ProtectedRoute from '../components/ProtectedRoute'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { userMockTestApi, MockTest } from './lib/api'

const difficultyBadge = (difficulty: MockTestDifficulty) => {
  switch (difficulty) {
    case 'Easy':
      return { bg: 'bg-secondary/40', text: 'text-secondary' }
    case 'Medium':
      return { bg: 'bg-accent/30', text: 'text-accent' }
    case 'Hard':
      return { bg: 'bg-button/30', text: 'text-button' }
    default:
      return { bg: 'bg-secondary/40', text: 'text-secondary' }
  }
}

const durationLabel = (minutes: number) => `${minutes} min`

export default function MockTestsListingPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [mockTests, setMockTests] = useState<MockTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filtering state
  const [examFilter, setExamFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')

  const EXAM_TYPES = ['UPSC', 'SSC', 'Banking', 'Railways', 'State PSC', 'NEET', 'JEE']
  const SUBJECTS = ['Mathematics', 'Reasoning', 'General Knowledge', 'Physics', 'Chemistry', 'Biology', 'English']

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true)
      try {
        // Build query params
        const params: any = {}
        if (examFilter) params.exam_type = examFilter
        if (subjectFilter) params.subject = subjectFilter
        
        const tests = await userMockTestApi.getMockTests(token || undefined, params)
        setMockTests(tests)
      } catch (error) {
        console.error('Failed to fetch mock tests:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTests()
  }, [token, examFilter, subjectFilter])

  const resetFilters = () => {
    setExamFilter('')
    setSubjectFilter('')
  }

  return (
    <ProtectedRoute>
      <MockTestsShell>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-2xl bg-button/15 border border-button/30">
                  <Sparkles className="w-5 h-5 text-button" />
                </div>
                <h1 className="text-3xl font-bold text-text">Mock Tests</h1>
              </div>
              <p className="mt-2 text-sm text-text/70">
                Attempt timed exams, get instant feedback, and analyze performance like a pro.
              </p>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 px-4 py-2 shadow-sm">
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-sm text-text/80">Exam-ready timing</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 px-4 py-2 shadow-sm">
                <ClipboardList className="w-4 h-4 text-secondary" />
                <span className="text-sm text-text/80">Structured review</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 px-4 py-2 shadow-sm">
                <BarChart3 className="w-4 h-4 text-button" />
                <span className="text-sm text-text/80">Performance analytics</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-[2rem] p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 mr-2">
              <div className="w-8 h-8 rounded-xl bg-[#4A465F]/5 flex items-center justify-center">
                <Filter className="w-4 h-4 text-[#4A465F]/60" />
              </div>
              <span className="text-sm font-bold text-[#4A465F]">Filters</span>
            </div>

            <div className="flex-1 flex flex-wrap gap-3">
              <div className="relative min-w-[180px]">
                <select 
                  value={examFilter}
                  onChange={(e) => setExamFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#4A465F]/10 rounded-2xl px-5 py-2.5 text-sm font-bold text-[#4A465F] focus:outline-none focus:ring-2 focus:ring-[#6FB7B4] transition-all cursor-pointer"
                >
                  <option value="">All Exams / Boards</option>
                  {EXAM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="relative min-w-[180px]">
                <select 
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#4A465F]/10 rounded-2xl px-5 py-2.5 text-sm font-bold text-[#4A465F] focus:outline-none focus:ring-2 focus:ring-[#6FB7B4] transition-all cursor-pointer"
                >
                  <option value="">All Subjects</option>
                  {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>

              {(examFilter || subjectFilter) && (
                <button 
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#4A465F]/10 text-xs font-bold text-[#4A465F]/60 hover:bg-[#F5F5F5] transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-20 text-text/40"
            >
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-bold">Loading mock tests...</p>
            </motion.div>
          ) : mockTests.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 rounded-3xl p-20 text-center border border-white/40 shadow-sm"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-text mb-2">No tests found</h3>
              <p className="text-text/40 font-medium max-w-xs mx-auto">Try adjusting your filters to find what you're looking for.</p>
              <button 
                onClick={resetFilters}
                className="mt-6 px-6 py-3 bg-[#5EC2B7] text-white rounded-2xl font-bold hover:bg-[#5EC2B7]/90 transition-all"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {mockTests.map((test, index) => {
                const badge = difficultyBadge(test.difficulty)
                return (
                  <motion.div
                    key={test.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    whileHover={{ y: -6, boxShadow: '0px 18px 40px rgba(95, 124, 255, 0.12)' }}
                    className="cursor-pointer rounded-3xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    onClick={() => router.push(`/mock-tests/${test.id}/instructions`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        router.push(`/mock-tests/${test.id}/instructions`)
                      }
                    }}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-lg bg-accent/10 border border-accent/20 text-[10px] font-black text-accent uppercase tracking-wider">
                              {test.exam_type}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-secondary/10 border border-secondary/20 text-[10px] font-black text-secondary uppercase tracking-wider">
                              {test.subject}
                            </span>
                          </div>
                          <h2 className="text-lg font-bold text-text truncate">{test.title}</h2>
                          <p className="mt-1 text-sm text-text/70">
                            {test.questions ? test.questions.length : 0} questions • {durationLabel(test.durationMinutes)}
                          </p>
                        </div>

                        <div
                          className={`shrink-0 rounded-2xl w-12 h-12 bg-gradient-to-br ${
                            test.difficulty === 'Easy'
                              ? 'from-secondary to-accent'
                              : test.difficulty === 'Medium'
                                ? 'from-accent to-button'
                                : 'from-button to-secondary'
                          } flex items-center justify-center shadow-sm`}
                        >
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} border border-white/40 ${badge.text}`}
                        >
                          {test.difficulty}
                        </span>
                        <span className="text-xs font-medium text-text/60">Timed • MCQ</span>
                      </div>

                      <div className="mt-5 rounded-2xl bg-white/60 border border-white/30 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                            <ClipboardList className="w-5 h-5 text-accent" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-text">Exam experience</div>
                            <div className="text-xs text-text/70">Focus mode with timed answers</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full rounded-2xl bg-button text-white font-bold py-3 shadow-sm hover:bg-button/90 transition-colors"
                      >
                        Start Test
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MockTestsShell>
    </ProtectedRoute>
  )
}

