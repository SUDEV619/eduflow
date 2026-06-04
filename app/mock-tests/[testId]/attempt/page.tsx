'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Clock, Loader2, AlertCircle, RefreshCcw } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'
import useMockTestAttempt from '../../components/testAttempt/useMockTestAttempt'
import { userMockTestApi, MockTest } from '../../lib/api'
import { useAuth } from '../../../context/AuthContext'

const formatMMSS = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
}

export default function MockTestAttemptPage() {
  const params = useParams<{ testId: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()

  const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId
  const [test, setTest] = useState<MockTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTest = useCallback(async () => {
    if (!testId) return

    setIsLoading(true)
    setError(null)
    
    try {
      console.log(`[MockTest] Fetching test: ${testId}, Token present: ${!!token}`)
      const data = await userMockTestApi.getMockTestDetail(testId, token || undefined)
      console.log('[MockTest] Response data:', data)
      setTest(data || null)
    } catch (err: any) {
      console.error('[MockTest] Error fetching test:', err)
      setError(err.message || 'Failed to load test. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [testId, token])

  useEffect(() => {
    if (!token) {
        router.push('/auth')
        return
    }
    fetchTest()
  }, [fetchTest, token, router])

  const durationSec = useMemo(() => {
    if (!test) return 0
    return test.durationMinutes * 60
  }, [test])

  const { attempt, isHydrated, startNewAttempt, submitAttempt, setAnswer, setLastActiveQuestionIndex } =
    useMockTestAttempt(testId ?? '')

  const shouldStart = searchParams.get('start') === '1'
  const startCalledRef = useRef(false)

  const handleStartAttempt = useCallback(async () => {
    if (!token || !testId || startCalledRef.current) return
    startCalledRef.current = true
    try {
      const data = await userMockTestApi.startAttempt(testId, token)
      startNewAttempt(data.id)
      // Clear the start param to prevent reset on refresh/re-render
      if (shouldStart) {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.delete('start')
        router.replace(`/mock-tests/${testId}/attempt?${newParams.toString()}`)
      }
    } catch (error) {
      console.error('Failed to start attempt:', error)
      alert('Failed to start attempt. Please try again.')
      router.push('/mock-tests')
    }
  }, [token, testId, startNewAttempt, router, shouldStart, searchParams])

  const [now, setNow] = useState(() => Date.now())
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false)
  const [navOpenMobile, setNavOpenMobile] = useState(false)

  const handleSubmitAttempt = async () => {
    if (!token || !attempt) return
    
    const totalAnswers = Object.keys(attempt.answers).length
    if (totalAnswers === 0) {
      alert('Please select at least one answer before submitting.')
      setConfirmSubmitOpen(false)
      return
    }

    setIsSubmitting(true)
    try {
      await userMockTestApi.submitAttempt(attempt.attemptId, attempt.answers, token)
      submitAttempt() // Local update
      router.replace(`/mock-tests/${testId}/results`)
    } catch (error: any) {
      console.error('Failed to submit attempt:', error)
      alert(error.message || 'Failed to submit attempt. Please check your connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExit = () => {
    if (confirm('Are you sure you want to exit? Your progress is saved locally.')) {
      router.push('/mock-tests')
    }
  }

  useEffect(() => {
    if (!test || !isHydrated) return

    if (shouldStart || !attempt) {
      handleStartAttempt()
      return
    }

    if (attempt?.submittedAt) {
      router.replace(`/mock-tests/${test.id}/results`)
    } else {
      // Sync active index with saved state only ONCE when attempt is loaded or changed from outside
      const savedIndex = attempt.lastActiveQuestionIndex ?? 0
      if (activeQuestionIndex === 0 && savedIndex !== 0) {
          setActiveQuestionIndex(Math.min(savedIndex, test.questions.length - 1))
      }
    }
  }, [isHydrated, test, attempt?.attemptId, attempt?.submittedAt, shouldStart])

  useEffect(() => {
    if (!test || !attempt) return
    if (activeQuestionIndex !== attempt.lastActiveQuestionIndex) {
        setLastActiveQuestionIndex(activeQuestionIndex)
    }
  }, [activeQuestionIndex, setLastActiveQuestionIndex])

  useEffect(() => {
    if (!attempt || attempt.submittedAt) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [attempt?.attemptId, attempt?.submittedAt])

  const remainingSec = useMemo(() => {
    if (!attempt || !test) return durationSec
    const elapsed = Math.floor((now - attempt.startedAt) / 1000)
    return Math.max(0, durationSec - elapsed)
  }, [attempt?.startedAt, durationSec, now, test])

  const answeredCount = useMemo(() => {
    if (!test || !attempt) return 0
    return test.questions.reduce((acc, q) => (attempt.answers[String(q.id)] !== undefined ? acc + 1 : acc), 0)
  }, [attempt?.answers, test])

  const unansweredCount = useMemo(() => {
    if (!test) return 0
    return test.questions.length - answeredCount
  }, [answeredCount, test])

  const isLowTime = remainingSec <= 120
  const isVeryLowTime = remainingSec <= 30

  useEffect(() => {
    if (!attempt || attempt.submittedAt) return
    if (remainingSec <= 0) {
      handleSubmitAttempt()
    }
  }, [attempt, remainingSec])

  useEffect(() => {
    if (!test) return
    setLastActiveQuestionIndex(activeQuestionIndex)
  }, [activeQuestionIndex, setLastActiveQuestionIndex, test])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hero flex flex-col items-center justify-center text-white/40">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold">Preparing exam environment...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-hero flex flex-col items-center justify-center text-white">
        <AlertCircle className="w-12 h-12 text-button mb-4" />
        <p className="font-bold mb-4">{error}</p>
        <button 
            onClick={fetchTest}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 bg-button text-white font-semibold hover:bg-button/90 transition-all"
        >
            <RefreshCcw className="w-4 h-4" />
            Retry
        </button>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text font-semibold">Mock test not found.</div>
      </div>
    )
  }

  const currentQuestion = test.questions[activeQuestionIndex]

  const timerBg = isVeryLowTime ? 'bg-button/30 border-button/70' : isLowTime ? 'bg-accent/20 border-accent/50' : 'bg-white/10 border-white/10'
  const timerPulse = isVeryLowTime

  return (
    <div className="min-h-screen bg-hero text-white relative overflow-hidden">
      {/* Focus vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at top, rgba(111,183,180,0.22), transparent 60%), radial-gradient(circle at bottom, rgba(94,194,183,0.18), transparent 55%)',
          }}
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <motion.div
        className="relative p-4 md:p-8 max-w-[1200px] mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-[280px]">
            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 transition-colors"
              onClick={handleExit}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Exit</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 flex-1">
            <div
              className={`rounded-2xl px-4 py-2 border ${timerBg} flex items-center gap-3`}
              aria-live="polite"
            >
              <Clock className="w-4 h-4" />
              <motion.span
                animate={timerPulse ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={timerPulse ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : undefined}
                className={`text-sm font-semibold ${isVeryLowTime ? 'text-white' : 'text-white/90'}`}
              >
                {formatMMSS(remainingSec)}
              </motion.span>
              <span className="text-xs text-white/70 hidden sm:inline">remaining</span>
            </div>

            <div className="hidden md:block">
              <div className="text-xs text-white/60">Test</div>
              <div className="text-sm font-semibold text-white/90 truncate max-w-[340px]">{test.title}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <div className="text-sm font-semibold">
                {answeredCount}/{test.questions.length}
              </div>
            </div>

            <button
              className="rounded-2xl px-4 py-2.5 bg-button text-white font-semibold shadow-sm hover:bg-button/90 transition-colors disabled:opacity-50"
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={!attempt || !!attempt?.submittedAt || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </header>

        <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-5 items-start">
          <main>
            <AnimatePresence mode="wait">
              <motion.section
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-3xl bg-white/5 border border-white/10 p-5 md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold tracking-wide uppercase text-white/55">Question</div>
                    <div className="mt-1 text-lg font-bold">
                      {activeQuestionIndex + 1} / {test.questions.length}
                    </div>
                  </div>
                  <div className="text-sm text-white/70">
                    {attempt?.answers[String(currentQuestion.id)] !== undefined ? 'Answered' : 'Unanswered'}
                  </div>
                </div>

                <div className="mt-4 text-base leading-relaxed text-white/90 font-medium">
                  {currentQuestion.prompt}
                </div>

                <div className="mt-5 space-y-3">
                  {currentQuestion.options.map((opt: { label: string }, optionIndex: number) => {
                    const qId = String(currentQuestion.id)
                    const selected = attempt?.answers[qId] === optionIndex
                    return (
                      <div
                        key={optionIndex}
                        onClick={() => {
                          setAnswer(qId, optionIndex)
                        }}
                        className={`flex items-start gap-3 rounded-2xl p-4 cursor-pointer transition-all border group ${
                          selected
                            ? 'bg-button/20 border-button/60'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="relative flex items-center mt-1">
                          <input
                            type="radio"
                            name={`q-${qId}`}
                            checked={selected}
                            readOnly
                            className="h-4 w-4 text-button border-white/20 bg-white/5 focus:ring-button pointer-events-none"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-sm font-semibold ${selected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                            {String.fromCharCode(65 + optionIndex)}. {opt.label}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    className="rounded-2xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 transition-colors text-sm font-semibold disabled:opacity-50"
                    onClick={() => setActiveQuestionIndex((i) => Math.max(0, i - 1))}
                    disabled={activeQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  <button
                    className="rounded-2xl px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 transition-colors text-sm font-semibold disabled:opacity-50"
                    onClick={() => setActiveQuestionIndex((i) => Math.min(test.questions.length - 1, i + 1))}
                    disabled={activeQuestionIndex === test.questions.length - 1}
                  >
                    Next
                  </button>
                </div>
              </motion.section>
            </AnimatePresence>
          </main>

          <aside className="hidden lg:block">
            <div className="rounded-3xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <div className="text-xs font-semibold tracking-wide uppercase text-white/55">
                    Navigator
                  </div>
                  <div className="text-sm font-semibold text-white/90 mt-1">
                    {answeredCount} answered • {unansweredCount} unanswered
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {test.questions.map((q, idx) => {
                  const answered = attempt?.answers[String(q.id)] !== undefined
                  const current = idx === activeQuestionIndex

                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`h-10 rounded-2xl text-sm font-semibold border transition-all ${
                        current
                          ? 'bg-button/30 border-button/70 text-white'
                          : answered
                            ? 'bg-accent/20 border-accent/40 text-white/90'
                            : 'bg-white/5 border-white/10 text-white/55 hover:bg-white/10'
                      }`}
                      aria-label={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>

        {/* Mobile navigator */}
        <div className="lg:hidden mt-5">
          <button
            className="w-full rounded-3xl px-4 py-3 bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/15 transition-colors"
            onClick={() => setNavOpenMobile((v) => !v)}
          >
            {navOpenMobile ? 'Hide' : 'Show'} Questions
          </button>

          <AnimatePresence>
            {navOpenMobile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="mt-4 rounded-3xl bg-white/5 border border-white/10 p-4"
              >
                <div className="text-xs font-semibold tracking-wide uppercase text-white/55">
                  Navigator
                </div>
                <div className="text-sm font-semibold text-white/90 mt-1">
                  {answeredCount} answered • {unansweredCount} unanswered
                </div>

                <div className="mt-4 grid grid-cols-6 gap-2">
                  {test.questions.map((q, idx) => {
                    const answered = attempt?.answers[String(q.id)] !== undefined
                    const current = idx === activeQuestionIndex
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setActiveQuestionIndex(idx)
                          setNavOpenMobile(false)
                        }}
                        className={`h-10 rounded-2xl text-sm font-semibold border transition-all ${
                          current
                            ? 'bg-button/30 border-button/70 text-white'
                            : answered
                              ? 'bg-accent/20 border-accent/40 text-white/90'
                              : 'bg-white/5 border-white/10 text-white/55 hover:bg-white/10'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <ConfirmModal
          open={confirmSubmitOpen}
          title="Submit test?"
          description={
            unansweredCount > 0
              ? `You have ${unansweredCount} unanswered question(s). Submitting will lock your answers.`
              : 'Your answers will be locked.'
          }
          confirmText="Submit"
          cancelText="Review"
          onClose={() => setConfirmSubmitOpen(false)}
          onConfirm={() => {
            setConfirmSubmitOpen(false)
            handleSubmitAttempt()
          }}
        />
      </motion.div>
    </div>
  )
}
