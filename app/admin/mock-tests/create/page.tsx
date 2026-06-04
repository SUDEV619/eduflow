
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, ChevronLeft, CheckCircle, Search, 
  Filter, Plus, Minus, FileText, Clock, HelpCircle, Save,
  RotateCcw, Layers, Zap, X, Trash2
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { adminApi, Question } from '../../mock-tests/services/api'
import { useRouter } from 'next/navigation'
import SubjectFilter, { standardizedSubjects } from '../../components/SubjectFilter'

export default function MockTestBuilder() {
  const { token } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [testInfo, setTestInfo] = useState({
    title: '',
    description: '',
    duration: 60,
    exam_type: '',
    subject: '',
    difficulty: 'Medium',
    is_published: false
  })

  const EXAM_TYPES = ['UPSC', 'SSC', 'Banking', 'Railways', 'State PSC', 'NEET', 'JEE']
  const SUBJECTS = standardizedSubjects
  const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
  
  // Question Selection State
  const [availableQuestions, setQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ subjects: [] as string[], difficulty: '' })
  const [isLoading, setIsLoading] = useState(false)

  // Multi-select state for Step 2
  const [checkedIds, setCheckedIds] = useState<number[]>([])

  // Fetch questions for Step 2
  useEffect(() => {
    if (step === 2) {
      const fetchQuestions = async () => {
        setIsLoading(true)
        if (!token) return
        try {
          // Fetch filtered questions
          const res = await adminApi.getQuestions(token, { ...filters, search: searchTerm }, 1)
          if (res.status === 'success') {
            setQuestions(res.data)
          }
        } finally {
          setIsLoading(false)
        }
      }
      fetchQuestions()
    }
  }, [step, token, filters, searchTerm])

  const handleToggleQuestion = (question: Question) => {
    if (selectedQuestions.some(q => q.id === question.id)) {
      setSelectedQuestions(prev => prev.filter(q => q.id !== question.id))
    } else {
      setSelectedQuestions(prev => [...prev, question])
    }
  }

  const handleToggleCheck = (id: number) => {
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSelectAllOnPage = () => {
    // Filter out questions that are already in checkedIds OR already selected in the test
    const unselectedIds = availableQuestions
      .map(q => q.id)
      .filter(id => !selectedQuestions.some(sq => sq.id === id))

    if (checkedIds.length === unselectedIds.length && unselectedIds.every(id => checkedIds.includes(id))) {
      setCheckedIds([])
    } else {
      setCheckedIds(unselectedIds)
    }
  }

  const handleBulkAdd = () => {
    const questionsToAdd = availableQuestions.filter(q => 
      checkedIds.includes(q.id) && !selectedQuestions.some(sq => sq.id === q.id)
    )
    setSelectedQuestions(prev => [...prev, ...questionsToAdd])
    setCheckedIds([])
  }

  const handleAddAllFiltered = () => {
    const newQuestions = availableQuestions.filter(aq => !selectedQuestions.some(sq => sq.id === aq.id))
    setSelectedQuestions(prev => [...prev, ...newQuestions])
  }

  const handleClearSelection = () => {
    setSelectedQuestions([])
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (publish: boolean) => {
    if (!token) return
    setIsSubmitting(true)
    try {
      // 1. Create Test
      const testRes = await adminApi.createMockTest(token, {
        ...testInfo,
        is_published: publish
      })
      
      if (testRes.status === 'success') {
        const testId = testRes.data.id
        
        // 2. Add Questions
        if (selectedQuestions.length > 0) {
          try {
            await adminApi.bulkAddQuestionsToTest(token, testId, selectedQuestions.map(q => q.id))
          } catch (qErr: any) {
            console.error('Failed to add questions:', qErr)
            alert(`Test created, but failed to add questions: ${qErr.message}`)
          }
        }

        
        router.push('/admin/mock-tests')
      }
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to save test.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalMarks = selectedQuestions.reduce((sum, q) => sum + q.marks, 0)
  const isAllOnPageChecked = availableQuestions.length > 0 && 
    availableQuestions.filter(q => !selectedQuestions.some(sq => sq.id === q.id)).length > 0 &&
    availableQuestions
      .filter(q => !selectedQuestions.some(sq => sq.id === q.id))
      .every(q => checkedIds.includes(q.id))

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Steps Header */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all ${
              step >= s ? 'bg-[#5EC2B7] text-white shadow-lg shadow-[#5EC2B7]/20' : 'bg-white border border-[#4A465F]/10 text-[#4A465F]/40'
            }`}>
              {step > s ? <CheckCircle className="w-6 h-6" /> : s}
            </div>
            <span className={`text-sm font-bold ${step >= s ? 'text-[#4A465F]' : 'text-[#4A465F]/40'}`}>
              {s === 1 ? 'Basic Info' : s === 2 ? 'Question Bank' : 'Final Review'}
            </span>
            {s < 3 && <div className={`w-12 h-0.5 rounded-full ${step > s ? 'bg-[#5EC2B7]' : 'bg-[#4A465F]/5'}`} />}
          </div>
        ))}
      </div>

      {/* Bulk Action Bar for Step 2 */}
      <AnimatePresence>
        {step === 2 && checkedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#2E2E2E] text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#5EC2B7] flex items-center justify-center text-xs font-black">
                {checkedIds.length}
              </div>
              <p className="font-bold text-sm tracking-tight">Questions selected</p>
            </div>
            
            <div className="h-8 w-px bg-white/10" />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setCheckedIds([])}
                className="text-sm font-bold text-white/60 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
              <button 
                onClick={handleBulkAdd}
                className="px-6 py-2 bg-[#5EC2B7] hover:bg-[#4DB0A6] text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-[#5EC2B7]/20"
              >
                <Plus className="w-4 h-4" />
                Add Selected Questions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-10 border border-[#4A465F]/5 shadow-sm min-h-[600px] flex flex-col"
      >
        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-8 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-[#5EC2B7]/10 flex items-center justify-center text-[#5EC2B7]">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#4A465F]">Test Configuration</h2>
                <p className="text-sm text-[#4A465F]/60">Define the core settings for this assessment</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Test Title</label>
                <input 
                  type="text" 
                  value={testInfo.title}
                  onChange={e => setTestInfo(prev => ({...prev, title: e.target.value}))}
                  className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:ring-2 focus:ring-[#6FB7B4] focus:outline-none font-bold text-[#4A465F] transition-all"
                  placeholder="e.g. UPSC Prelims 2024 - History GS"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Duration (Min)</label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A465F]/30" />
                    <input 
                      type="number" 
                      value={testInfo.duration}
                      onChange={e => setTestInfo(prev => ({...prev, duration: parseInt(e.target.value) || 0}))}
                      className="w-full pl-14 pr-6 py-4 bg-[#F5F5F5] rounded-2xl focus:ring-2 focus:ring-[#6FB7B4] focus:outline-none font-bold text-[#4A465F] transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Exam / Board</label>
                  <select 
                    value={testInfo.exam_type}
                    onChange={e => setTestInfo(prev => ({...prev, exam_type: e.target.value}))}
                    className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:ring-2 focus:ring-[#6FB7B4] focus:outline-none font-bold text-[#4A465F] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose Board...</option>
                    {EXAM_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Primary Subject</label>
                  <select 
                    value={testInfo.subject}
                    onChange={e => setTestInfo(prev => ({...prev, subject: e.target.value}))}
                    className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:ring-2 focus:ring-[#6FB7B4] focus:outline-none font-bold text-[#4A465F] transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose Subject...</option>
                    {SUBJECTS.map(sub => <option key={sub.id} value={sub.id}>{sub.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Difficulty Level</label>
                  <select 
                    value={testInfo.difficulty}
                    onChange={e => setTestInfo(prev => ({...prev, difficulty: e.target.value}))}
                    className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:ring-2 focus:ring-[#6FB7B4] focus:outline-none font-bold text-[#4A465F] transition-all appearance-none cursor-pointer"
                  >
                    {DIFFICULTIES.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Test Description</label>
                <textarea 
                  rows={4}
                  value={testInfo.description}
                  onChange={e => setTestInfo(prev => ({...prev, description: e.target.value}))}
                  className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:ring-2 focus:ring-[#6FB7B4] focus:outline-none font-bold text-[#4A465F] resize-none transition-all"
                  placeholder="Describe what this test covers..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 2 && (
          <div className="h-full flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6FB7B4]/10 flex items-center justify-center text-[#6FB7B4]">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#4A465F]">Question Bank</h2>
                  <p className="text-sm text-[#4A465F]/60">Select questions manually or use bulk actions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#F5F5F5] px-5 py-3 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Selected</p>
                  <p className="text-lg font-black text-[#5EC2B7]">{selectedQuestions.length}</p>
                </div>
                <div className="bg-[#F5F5F5] px-5 py-3 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Marks</p>
                  <p className="text-lg font-black text-[#5EC2B7]">{totalMarks}</p>
                </div>
                {selectedQuestions.length > 0 && (
                  <button 
                    onClick={handleClearSelection}
                    className="p-3 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 text-sm font-bold"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-[#F5F5F5]/50 p-6 rounded-3xl border border-[#4A465F]/5 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A465F]/30" />
                  <input 
                    type="text" 
                    placeholder="Search by question text..." 
                    className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl focus:ring-2 focus:ring-[#6FB7B4] focus:outline-none font-medium text-[#4A465F] shadow-sm border border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3">
                  <SubjectFilter 
                    selectedSubjects={filters.subjects}
                    onToggle={(subId) => {
                      setFilters(prev => ({
                        ...prev,
                        subjects: prev.subjects.includes(subId)
                          ? prev.subjects.filter(s => s !== subId)
                          : [...prev.subjects, subId]
                      }))
                    }}
                    onClear={() => setFilters(prev => ({ ...prev, subjects: [] }))}
                  />

                  <div className="relative">
                    <select 
                      className="appearance-none pl-6 pr-12 py-4 bg-white rounded-2xl font-bold text-[#4A465F]/60 border border-transparent focus:ring-2 focus:ring-[#6FB7B4] outline-none shadow-sm cursor-pointer h-[52px]"
                      value={filters.difficulty}
                      onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <option value="">All Difficulty</option>
                      {DIFFICULTIES.map(diff => <option key={diff} value={diff}>{diff}</option>)}
                    </select>
                    <Filter className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/20 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={handleSelectAllOnPage}
                    className={`w-5 h-5 rounded-md border-2 transition-all cursor-pointer flex items-center justify-center ${
                      isAllOnPageChecked 
                        ? 'bg-[#5EC2B7] border-[#5EC2B7]' 
                        : 'border-[#4A465F]/10 bg-white hover:border-[#5EC2B7]'
                    }`}
                  >
                    {isAllOnPageChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <p className="text-xs font-bold text-[#4A465F]/40 uppercase tracking-widest cursor-pointer" onClick={handleSelectAllOnPage}>
                    Select All Visible
                  </p>
                </div>
                <p className="text-xs font-bold text-[#4A465F]/40 italic">
                  Showing {availableQuestions.length} matching questions
                </p>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-4 max-h-[500px]">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-[#4A465F]/20">
                  <RotateCcw className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-bold">Fetching matching questions...</p>
                </div>
              ) : availableQuestions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-[#4A465F]/20 border-2 border-dashed border-[#4A465F]/5 rounded-3xl">
                  <Search className="w-12 h-12 mb-4" />
                  <p className="font-bold">No questions found matching your criteria</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {availableQuestions.map((q, index) => {
                    const isSelected = selectedQuestions.some(sq => sq.id === q.id)
                    const isChecked = checkedIds.includes(q.id)
                    return (
                      <motion.div 
                        key={q.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => !isSelected && handleToggleCheck(q.id)}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-6 group ${
                          isSelected 
                            ? 'border-[#5EC2B7] bg-[#5EC2B7]/5 opacity-60 cursor-default' 
                            : isChecked 
                              ? 'border-[#A8DAD6] bg-[#A8DAD6]/10 shadow-sm'
                              : 'border-[#4A465F]/5 bg-white hover:border-[#4A465F]/10 hover:shadow-md hover:-translate-y-1'
                        }`}
                      >
                        <div className="shrink-0">
                          <div 
                            className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                              isSelected 
                                ? 'bg-[#5EC2B7] border-[#5EC2B7]' 
                                : isChecked
                                  ? 'bg-[#5EC2B7] border-[#5EC2B7]'
                                  : 'border-[#4A465F]/10 bg-white group-hover:border-[#5EC2B7]'
                            }`}
                          >
                            {(isSelected || isChecked) && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 mr-6">
                          <p className={`font-bold text-lg mb-3 line-clamp-2 ${isSelected ? 'text-[#4A465F]/60' : 'text-[#4A465F]'}`}>
                            {q.text}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-[#F5F5F5] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#4A465F]/60 border border-[#4A465F]/5">
                              {standardizedSubjects.find(s => s.id === q.subject)?.label || q.subject}
                            </span>
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-transparent ${
                              q.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                              q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                              'bg-rose-50 text-rose-600'
                            }`}>
                              {q.difficulty}
                            </span>
                            <span className="bg-[#4A465F]/5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#4A465F]/40">
                              {q.marks} Marks
                            </span>
                          </div>
                        </div>
                        
                        {!isSelected && !isChecked && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleQuestion(q);
                            }}
                            className="w-12 h-12 rounded-2xl bg-[#F5F5F5] text-[#4A465F]/20 flex items-center justify-center hover:bg-[#5EC2B7] hover:text-white transition-all shrink-0"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        )}
                        {isSelected && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleQuestion(q);
                            }}
                            className="w-12 h-12 rounded-2xl bg-[#5EC2B7] text-white flex items-center justify-center shadow-lg shadow-[#5EC2B7]/30 shrink-0"
                          >
                            <CheckCircle className="w-6 h-6" />
                          </button>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex gap-3 mb-4">
                  <span className="px-3 py-1.5 rounded-xl bg-[#6FB7B4]/10 border border-[#6FB7B4]/20 text-[10px] font-black text-[#6FB7B4] uppercase tracking-wider">
                    {testInfo.exam_type}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-[#A8DAD6]/10 border border-[#A8DAD6]/20 text-[10px] font-black text-[#4A465F]/60 uppercase tracking-wider">
                    {SUBJECTS.find(s => s.id === testInfo.subject)?.label || testInfo.subject}
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-[#4A465F] mb-4 tracking-tight leading-tight">{testInfo.title}</h2>
                <p className="text-[#4A465F]/60 text-lg leading-relaxed max-w-2xl">{testInfo.description}</p>
              </div>
              
              <div className="w-full md:w-auto bg-[#F5F5F5] p-8 rounded-[2.5rem] flex md:flex-col items-center justify-between gap-4 border border-[#4A465F]/5">
                <div className="text-center md:text-right w-full">
                  <p className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest mb-1">Total Marks</p>
                  <p className="text-5xl font-black text-[#5EC2B7]">{totalMarks}</p>
                </div>
                <div className="h-12 w-px bg-[#4A465F]/10 md:w-full md:h-px my-2" />
                <div className="text-center md:text-right w-full">
                  <p className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest mb-1">Total MCQs</p>
                  <p className="text-2xl font-bold text-[#4A465F]">{selectedQuestions.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#F5F5F5]/50 p-8 rounded-[2rem] flex items-center gap-6 border border-[#4A465F]/5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-[#6FB7B4]">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest">Test Duration</p>
                  <p className="text-2xl font-bold text-[#4A465F]">{testInfo.duration} Minutes</p>
                </div>
              </div>
              <div className="bg-[#F5F5F5]/50 p-8 rounded-[2rem] flex items-center gap-6 border border-[#4A465F]/5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-[#5EC2B7]">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest">Difficulty</p>
                  <p className="text-2xl font-bold text-[#4A465F]">{testInfo.difficulty}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#4A465F]/5 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#4A465F] flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#4A465F]/20" />
                  Selected Questions
                </h3>
                <span className="text-sm font-bold text-[#4A465F]/40 italic">Scroll to review all</span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {selectedQuestions.map((q, i) => (
                  <div key={q.id} className="flex items-start gap-6 p-6 rounded-2xl bg-[#F5F5F5]/30 hover:bg-[#F5F5F5]/50 transition-colors border border-transparent hover:border-[#4A465F]/5 group">
                    <span className="font-black text-2xl text-[#4A465F]/10 group-hover:text-[#5EC2B7]/20 transition-colors w-8 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <div className="flex-1">
                      <p className="font-bold text-[#4A465F] text-base mb-2">{q.text}</p>
                      <div className="flex gap-3">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-[#4A465F]/40 bg-white px-2 py-1 rounded-md border border-[#4A465F]/5">{SUBJECTS.find(s => s.id === q.subject)?.label || q.subject}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-[#4A465F]/40 bg-white px-2 py-1 rounded-md border border-[#4A465F]/5">{q.difficulty}</span>
                      </div>
                    </div>
                    <span className="text-sm font-black text-[#5EC2B7] bg-[#5EC2B7]/5 px-3 py-1 rounded-lg shrink-0">{q.marks}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-[#4A465F]/5 shadow-lg shadow-[#4A465F]/5">
        <button 
          onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          className="px-8 py-4 bg-white border border-[#4A465F]/10 text-[#4A465F] rounded-2xl font-bold flex items-center gap-3 hover:bg-[#F5F5F5] transition-all hover:shadow-md"
        >
          <ChevronLeft className="w-5 h-5 text-[#4A465F]/40" />
          {step === 1 ? 'Cancel Creation' : 'Previous Step'}
        </button>

        <div className="flex gap-4">
          {step < 3 ? (
            <button 
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!testInfo.title || !testInfo.exam_type || !testInfo.subject) || step === 2 && selectedQuestions.length === 0}
              className="px-10 py-4 bg-[#5EC2B7] text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-[#5EC2B7]/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
            >
              Continue Process
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex gap-4">
              <button 
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="px-8 py-4 bg-[#F5F5F5] text-[#4A465F] rounded-2xl font-bold hover:bg-[#4A465F]/10 transition-all flex items-center gap-2"
              >
                {isSubmitting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Layers className="w-5 h-5" />}
                Save Draft
              </button>
              <button 
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="px-10 py-4 bg-[#5EC2B7] text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-[#5EC2B7]/30 hover:scale-105 active:scale-95 transition-all"
              >
                {isSubmitting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Publish Test Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
