
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileText,
  Clock,
  HelpCircle,
  Loader2,
  Filter,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adminApi, MockTest } from './services/api'
import Link from 'next/link'
import SubjectFilter, { standardizedSubjects } from '../components/SubjectFilter'

const EXAM_TYPES = ['UPSC', 'SSC', 'Banking', 'Railways', 'State PSC', 'NEET', 'JEE']

export default function MockTestManagement() {
  const { token } = useAuth()
  const [mockTests, setMockTests] = useState<MockTest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filtering state
  const [examFilter, setExamFilter] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const fetchTests = async () => {
    setIsLoading(true)
    if (!token) return
    try {
      const params: any = {}
      if (examFilter) params.exam_type = examFilter
      if (subjects.length > 0) params.subjects = subjects
      if (searchTerm) params.search = searchTerm

      const res = await adminApi.getMockTests(token, 1, params)
      if (res.status === 'success') {
        setMockTests(res.data)
      }
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to fetch mock tests.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [token, examFilter, subjects, searchTerm])

  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    if (!token) return
    try {
      await adminApi.publishMockTest(token, id, !currentStatus)
      fetchTests()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to update test status.')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this test?')) return
    if (!token) return
    try {
      await adminApi.deleteMockTest(token, id)
      fetchTests()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to delete mock test.')
    }
  }

  const toggleSubjectFilter = (subject: string) => {
    setSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    )
  }

  const resetFilters = () => {
    setExamFilter('')
    setSubjects([])
    setSearchTerm('')
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#4A465F] tracking-tight">Mock Test Management</h1>
          <p className="text-[#4A465F]/60 font-medium">Create and manage assessment tests</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/mock-tests/create">
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="px-6 py-3 bg-[#5EC2B7] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#5EC2B7]/20 transition-all"
             >
               <Plus className="w-5 h-5" />
               Create New Test
             </motion.button>
          </Link>
        </div>
      </div>

      {/* Filter Header */}
      <div className="space-y-4">
        <div className="bg-white rounded-[2rem] p-4 border border-[#4A465F]/5 shadow-sm flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/30" />
            <input 
              type="text" 
              placeholder="Search tests..." 
              className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none font-medium text-[#4A465F]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm font-bold text-[#4A465F]/60 focus:ring-2 focus:ring-[#6FB7B4] outline-none cursor-pointer h-[52px]"
            >
              <option value="">All Exams</option>
              {EXAM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>

            <SubjectFilter 
              selectedSubjects={subjects}
              onToggle={toggleSubjectFilter}
              onClear={() => setSubjects([])}
            />

            {(examFilter || subjects.length > 0 || searchTerm) && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-500 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all h-[52px]"
              >
                <X className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-[#4A465F]/40">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">Loading mock tests...</p>
        </div>
      ) : mockTests.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border border-[#4A465F]/5">
          <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-[#4A465F]/20" />
          </div>
          <h3 className="text-xl font-bold text-[#4A465F] mb-2">No tests found</h3>
          <p className="text-[#4A465F]/40 font-medium mb-8">Try adjusting your filters or create a new test.</p>
          <Link href="/admin/mock-tests/create">
            <button className="px-8 py-3 bg-[#4A465F] text-white rounded-xl font-bold hover:bg-[#4A465F]/90 transition-all">
              Create Test
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {mockTests.map((test, index) => {
              const subjectLabel = standardizedSubjects.find(s => s.id === test.subject)?.label || test.subject
              return (
                <motion.div
                  key={test.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-[#4A465F]/5 shadow-sm group relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#A8DAD6]/10 blur-3xl -mr-16 -mt-16 group-hover:bg-[#5EC2B7]/20 transition-all" />

                  <div className="flex justify-between items-start mb-6">
                    <div className="p-4 rounded-2xl bg-[#F5F5F5] group-hover:bg-[#5EC2B7]/10 transition-colors">
                      <FileText className="w-6 h-6 text-[#5EC2B7]" />
                    </div>
                    <button 
                      onClick={() => handleTogglePublish(test.id, test.is_published)}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${
                        test.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {test.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-lg bg-[#6FB7B4]/10 border border-[#6FB7B4]/20 text-[10px] font-black text-[#6FB7B4] uppercase tracking-wider">
                      {test.exam_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#A8DAD6]/10 border border-[#A8DAD6]/20 text-[10px] font-black text-[#4A465F]/60 uppercase tracking-wider">
                      {subjectLabel}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#4A465F] mb-4 group-hover:text-[#5EC2B7] transition-colors line-clamp-1">
                    {test.title}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2 text-[#4A465F]/40">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-bold">{test.duration} Min</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#4A465F]/40">
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">{test.question_count || 0} MCQs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6 border-t border-[#4A465F]/5 mt-auto">
                    <Link href={`/admin/mock-tests/edit/${test.id}`} className="flex-1">
                      <button className="w-full py-3 rounded-xl bg-[#F5F5F5] text-[#4A465F] text-xs font-black uppercase tracking-widest hover:bg-[#4A465F] hover:text-white transition-all flex items-center justify-center gap-2">
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(test.id)}
                      className="p-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <Link href="/admin/mock-tests/create">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[340px] rounded-[2.5rem] border-4 border-dashed border-[#4A465F]/5 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-[#5EC2B7]/20 hover:bg-[#5EC2B7]/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-[#4A465F]/20 group-hover:text-[#5EC2B7]" />
              </div>
              <p className="font-bold text-[#4A465F]/40 group-hover:text-[#5EC2B7]">Create New Test</p>
            </motion.div>
          </Link>
        </div>
      )}
    </div>
  )
}

