
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Trash2, Edit, Plus, FileText, 
  Upload, Loader2, AlertCircle, CheckCircle2, X, ChevronDown,
  HelpCircle, Zap, Target, BookOpen, Layers
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { adminApi, Question } from '../mock-tests/services/api'
import Link from 'next/link'
import SubjectFilter, { standardizedSubjects } from '../components/SubjectFilter'

export default function QuestionBank() {
  const { token } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<{ subjects: string[], difficulty: string }>({ subjects: [], difficulty: '' })
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 })
  
  // Selection state
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Add Question Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A' as 'A' | 'B' | 'C' | 'D',
    subject: '',
    topic: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    marks: 1,
    explanation: ''
  })

  // Multi-select dropdown state
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSubjectDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchQuestions = async () => {
    setIsLoading(true)
    if (!token) return
    try {
      const res = await adminApi.getQuestions(token, { ...filters, search: searchTerm }, pagination.page)
      if (res.status === 'success') {
        setQuestions(res.data)
        if (res.pagination) {
            setPagination(prev => ({ ...prev, total_pages: res.pagination!.total_pages }))
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
      // Clear selection when fetching new data (e.g., page change)
      setSelectedQuestions([])
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [token, pagination.page, filters, searchTerm]) // eslint-disable-line

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    if (!token) return
    try {
      await adminApi.deleteQuestion(token, id)
      fetchQuestions()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to delete question.')
    }
  }

  const handleBulkDelete = async () => {
    if (!token || selectedQuestions.length === 0) return
    
    setIsDeleting(true)
    try {
      await adminApi.bulkDeleteQuestions(token, selectedQuestions)
      setShowDeleteModal(false)
      setSelectedQuestions([])
      fetchQuestions()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to delete questions.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    
    if (!formData.subject) {
      alert("Please select a subject.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await adminApi.createQuestion(token, formData)
      if (res.status === 'success') {
        setShowAddModal(false)
        setFormData({
          text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'A',
          subject: '',
          topic: '',
          difficulty: 'Medium',
          marks: 1,
          explanation: ''
        })
        fetchQuestions()
      }
    } catch (error: any) {
      alert(error.message || "Failed to add question.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(questions.map(q => q.id))
    }
  }

  const toggleSelectQuestion = (id: number) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSubjectFilter = (subject: string) => {
    setFilters(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
      return { ...prev, subjects }
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({ subjects: [], difficulty: '' })
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const isAllSelected = questions.length > 0 && selectedQuestions.length === questions.length
  const isFormValid = formData.text && formData.option_a && formData.option_b && formData.option_c && formData.option_d && formData.subject && formData.topic

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#4A465F] tracking-tight">Question Bank</h1>
          <p className="text-[#4A465F]/60 font-medium">Manage your centralized repository of questions</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/questions/upload" className="px-6 py-3 bg-white border border-[#4A465F]/10 text-[#4A465F] rounded-2xl font-bold flex items-center gap-2 hover:bg-[#F5F5F5] transition-all">
            <Upload className="w-5 h-5" />
            Upload CSV
          </Link>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-[#5EC2B7] text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-[#5EC2B7]/20 transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedQuestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#2E2E2E] text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5EC2B7] flex items-center justify-center text-xs font-black">
                {selectedQuestions.length}
              </div>
              <p className="font-bold text-sm tracking-tight">Questions selected</p>
            </div>
            
            <div className="h-8 w-px bg-white/10" />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedQuestions([])}
                className="text-sm font-bold text-white/60 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-[2rem] border border-[#4A465F]/5 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/30" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] rounded-xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-medium text-[#4A465F]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <SubjectFilter 
              selectedSubjects={filters.subjects}
              onToggle={toggleSubjectFilter}
              onClear={() => setFilters(prev => ({ ...prev, subjects: [] }))}
            />

            <select 
              className="px-4 py-3 bg-[#F5F5F5] rounded-xl font-bold text-[#4A465F]/60 outline-none cursor-pointer hover:bg-[#E8EEED] transition-all h-[52px]"
              value={filters.difficulty}
              onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <button 
              onClick={clearFilters}
              className="px-4 py-3 text-xs font-black text-[#4A465F]/40 hover:text-[#5EC2B7] uppercase tracking-widest transition-colors h-[52px]"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F5F5F5]/50 border-b border-[#4A465F]/5">
              <tr>
                <th className="pl-8 py-6 w-12">
                  <div 
                    onClick={toggleSelectAll}
                    className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${
                      isAllSelected 
                        ? 'bg-[#5EC2B7] border-[#5EC2B7]' 
                        : 'border-[#4A465F]/10 bg-white hover:border-[#5EC2B7]'
                    }`}
                  >
                    {isAllSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                </th>
                <th className="px-6 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">Question</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">Subject</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">Difficulty</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A465F]/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#4A465F]/40">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading questions...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#4A465F]/40 font-bold">
                    No questions found.
                  </td>
                </tr>
              ) : (
                questions.map((q) => {
                  const isSelected = selectedQuestions.includes(q.id)
                  const subjectLabel = standardizedSubjects.find(s => s.id === q.subject)?.label || q.subject
                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={q.id} 
                      className={`transition-colors group ${isSelected ? 'bg-[#A8DAD6]/10' : 'hover:bg-[#F5F5F5]/30'}`}
                    >
                      <td className="pl-8 py-6">
                        <div 
                          onClick={() => toggleSelectQuestion(q.id)}
                          className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${
                            isSelected 
                              ? 'bg-[#5EC2B7] border-[#5EC2B7]' 
                              : 'border-[#4A465F]/10 bg-white hover:border-[#5EC2B7]'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <p className="font-bold text-[#4A465F] line-clamp-1">{q.text}</p>
                        <p className="text-xs font-bold text-[#4A465F]/40 mt-1">{q.topic} • {q.marks} Marks</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-lg bg-[#5EC2B7]/10 text-[#5EC2B7] text-xs font-black uppercase tracking-widest">
                          {subjectLabel}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${
                          q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 rounded-xl hover:bg-[#F5F5F5] text-[#4A465F]/40 hover:text-[#5EC2B7] transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(q.id)}
                            className="p-2 rounded-xl hover:bg-rose-50 text-[#4A465F]/40 hover:text-rose-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-8 py-6 bg-[#F5F5F5]/30 border-t border-[#4A465F]/5 flex items-center justify-between">
          <p className="text-xs font-bold text-[#4A465F]/40">
            Page {pagination.page} of {pagination.total_pages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="px-4 py-2 bg-white border border-[#4A465F]/10 rounded-xl text-xs font-bold text-[#4A465F] disabled:opacity-50 hover:bg-[#F5F5F5] transition-all"
            >
              Previous
            </button>
            <button 
              disabled={pagination.page >= pagination.total_pages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="px-4 py-2 bg-white border border-[#4A465F]/10 rounded-xl text-xs font-bold text-[#4A465F] disabled:opacity-50 hover:bg-[#F5F5F5] transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowAddModal(false)}
              className="absolute inset-0 bg-[#2E2E2E]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-[#F5F5F5] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-10 py-8 bg-white border-b border-[#4A465F]/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#5EC2B7]/10 flex items-center justify-center text-[#5EC2B7]">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#4A465F] tracking-tight">Add New Question</h3>
                    <p className="text-[#4A465F]/40 text-xs font-bold uppercase tracking-widest">Create a single MCQ entry</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-3 hover:bg-[#F5F5F5] rounded-2xl transition-colors text-[#4A465F]/20 hover:text-rose-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                <form id="add-question-form" onSubmit={handleAddQuestion} className="space-y-8">
                  {/* Category & Topic Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                        <Layers className="w-3 h-3" />
                        Select Subject <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          required
                          value={formData.subject}
                          onChange={e => setFormData({...formData, subject: e.target.value})}
                          className={`w-full px-6 py-4 bg-white rounded-2xl font-bold text-[#4A465F] border transition-all appearance-none outline-none focus:ring-4 focus:ring-[#6FB7B4]/10 ${formData.subject ? 'border-[#6FB7B4]' : 'border-transparent'}`}
                        >
                          <option value="">Choose Subject...</option>
                          {standardizedSubjects.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A465F]/20 pointer-events-none" />
                      </div>
                      {!formData.subject && <p className="text-[10px] text-rose-500 font-bold ml-4">Please select a subject</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Topic Name <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Ancient India, Trigonometry..."
                        value={formData.topic}
                        onChange={e => setFormData({...formData, topic: e.target.value})}
                        className="w-full px-6 py-4 bg-white rounded-2xl font-bold text-[#4A465F] border border-transparent focus:border-[#6FB7B4] transition-all outline-none focus:ring-4 focus:ring-[#6FB7B4]/10"
                      />
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <HelpCircle className="w-3 h-3" />
                      Question Prompt <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Type your question here..."
                      value={formData.text}
                      onChange={e => setFormData({...formData, text: e.target.value})}
                      className="w-full px-8 py-6 bg-white rounded-[2rem] font-bold text-[#4A465F] border border-transparent focus:border-[#6FB7B4] transition-all outline-none focus:ring-4 focus:ring-[#6FB7B4]/10 resize-none text-lg"
                    />
                  </div>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                      <div key={opt} className="space-y-2">
                        <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4">Option {opt.toUpperCase()} <span className="text-rose-500">*</span></label>
                        <div className="relative group">
                          <div className={`absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center font-black text-[#4A465F]/20 group-focus-within:text-[#6FB7B4] transition-colors border-r border-[#4A465F]/5`}>
                            {opt.toUpperCase()}
                          </div>
                          <input 
                            type="text"
                            required
                            placeholder={`Value for Option ${opt.toUpperCase()}`}
                            value={formData[`option_${opt}`]}
                            onChange={e => setFormData({...formData, [`option_${opt}`]: e.target.value})}
                            className="w-full pl-16 pr-6 py-4 bg-white rounded-2xl font-bold text-[#4A465F] border border-transparent focus:border-[#6FB7B4] transition-all outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Settings Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4">Correct Answer</label>
                      <div className="flex bg-white p-1.5 rounded-2xl gap-1">
                        {(['A', 'B', 'C', 'D'] as const).map(letter => (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => setFormData({...formData, correct_option: letter})}
                            className={`flex-1 py-2.5 rounded-xl font-black transition-all ${formData.correct_option === letter ? 'bg-[#5EC2B7] text-white shadow-lg shadow-[#5EC2B7]/20' : 'text-[#4A465F]/20 hover:bg-[#F5F5F5]'}`}
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4">Difficulty</label>
                      <select 
                        value={formData.difficulty}
                        onChange={e => setFormData({...formData, difficulty: e.target.value as any})}
                        className="w-full px-6 py-4 bg-white rounded-2xl font-bold text-[#4A465F] border border-transparent focus:border-[#6FB7B4] outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4">Marks</label>
                      <input 
                        type="number"
                        min={1}
                        value={formData.marks}
                        onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 1})}
                        className="w-full px-6 py-4 bg-white rounded-2xl font-bold text-[#4A465F] border border-transparent focus:border-[#6FB7B4] outline-none"
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-4 flex items-center gap-2">
                      <BookOpen className="w-3 h-3" />
                      Explanation (Optional)
                    </label>
                    <textarea 
                      rows={2}
                      placeholder="Explain why the answer is correct..."
                      value={formData.explanation}
                      onChange={e => setFormData({...formData, explanation: e.target.value})}
                      className="w-full px-6 py-4 bg-white rounded-2xl font-bold text-[#4A465F] border border-transparent focus:border-[#6FB7B4] transition-all outline-none resize-none"
                    />
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-10 py-8 bg-white border-t border-[#4A465F]/5 flex items-center justify-end gap-4 shrink-0">
                <button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-8 py-4 bg-[#F5F5F5] text-[#4A465F] rounded-2xl font-black hover:bg-[#4A465F]/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  form="add-question-form"
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="px-10 py-4 bg-[#5EC2B7] text-white rounded-2xl font-black shadow-xl shadow-[#5EC2B7]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  {isSubmitting ? 'Saving...' : 'Create Question'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setShowDeleteModal(false)}
              className="absolute inset-0 bg-[#2E2E2E]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-0 opacity-50" />
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mb-6">
                  <Trash2 className="w-10 h-10 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-[#4A465F] mb-2 tracking-tight">Delete Questions?</h3>
                <p className="text-[#4A465F]/60 font-bold mb-8 leading-relaxed">
                  Are you sure you want to delete <span className="text-rose-500">{selectedQuestions.length}</span> selected questions? This action cannot be undone.
                </p>
                
                <div className="flex w-full gap-4">
                  <button 
                    disabled={isDeleting}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-8 py-4 bg-[#F5F5F5] text-[#4A465F] rounded-2xl font-black hover:bg-[#4A465F]/5 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isDeleting}
                    onClick={handleBulkDelete}
                    className="flex-1 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Yes, Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
