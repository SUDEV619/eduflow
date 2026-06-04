'use client'

import { useMemo, useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, ClipboardList, Target, ArrowLeft, Loader2 } from 'lucide-react'
import MockTestsShell from '../../components/MockTestsShell'
import { type MockTestDifficulty } from '../../mockTestsData'
import { userMockTestApi, MockTest } from '../../lib/api'
import { useAuth } from '../../../context/AuthContext'

export default function MockTestInstructionsPage() {
  const params = useParams<{ testId: string }>()
  const router = useRouter()
  const { token } = useAuth()
  const [ack, setAck] = useState(false)
  const [test, setTest] = useState<MockTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId

  useEffect(() => {
    if (testId) {
      const fetchTest = async () => {
        setIsLoading(true)
        try {
          const data = await userMockTestApi.getMockTestDetail(testId, token || undefined)
          setTest(data)
        } catch (error) {
          console.error('Failed to fetch test detail:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchTest()
    }
  }, [testId, token])

  const badge = (difficulty?: MockTestDifficulty) => {
    const d = difficulty ?? 'Medium'
    if (d === 'Easy') return 'bg-secondary/40 text-secondary'
    if (d === 'Medium') return 'bg-accent/30 text-accent'
    return 'bg-button/30 text-button'
  }

  if (isLoading) {
    return (
      <MockTestsShell>
        <div className="p-20 flex flex-col items-center justify-center text-text/40">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">Loading test instructions...</p>
        </div>
      </MockTestsShell>
    )
  }

  if (!test) {
    return (
      <MockTestsShell>
        <div className="p-6 text-text">Mock test not found.</div>
      </MockTestsShell>
    )
  }

  const minutes = test.durationMinutes
  const questionCount = test.questions.length

  return (
    <MockTestsShell>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 border border-white/40 hover:bg-white/80 transition-colors"
            onClick={() => router.push('/mock-tests')}
          >
            <ArrowLeft className="w-4 h-4 text-text/70" />
            <span className="text-sm font-semibold text-text/80">Back</span>
          </button>
        </div>

        <div className="mt-5 grid lg:grid-cols-2 gap-6 items-start">
          <motion.div
            className="lg:sticky lg:top-[96px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="rounded-3xl bg-white/80 border border-white/40 shadow-sm p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-wide uppercase text-text/60">
                    Test Instructions
                  </div>
                  <h1 className="mt-2 text-2xl font-bold text-text">{test.title}</h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border border-white/40 ${badge(test.difficulty)}`}>
                      {test.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-button/15 text-button border border-button/20">
                      <Clock className="w-3.5 h-3.5 inline-block mr-2" />
                      {minutes} min
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/20">
                      <ClipboardList className="w-3.5 h-3.5 inline-block mr-2" />
                      {questionCount} questions
                    </span>
                  </div>
                </div>

                <div className="w-14 h-14 rounded-3xl bg-button/15 border border-button/25 flex items-center justify-center">
                  <Target className="w-7 h-7 text-button" />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white/60 border border-white/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-button/20 border border-button/30 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-button" />
                    </div>
                    <div>
                      <div className="font-semibold text-text">Exam-like timing</div>
                      <div className="text-sm text-text/70 mt-1">
                        The timer starts once you begin. Your answers auto-save while you attempt.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/60 border border-white/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-secondary/25 border border-secondary/30 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <div className="font-semibold text-text">Marking scheme</div>
                      <div className="text-sm text-text/70 mt-1">
                        Correct = +{test.marking.correctPoints} point, Incorrect = +{test.marking.incorrectPoints}, Unanswered = +{test.marking.unansweredPoints}.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/60 border border-white/30 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-text">Focus rules</div>
                      <div className="text-sm text-text/70 mt-1">
                        No distractions. Answer carefully. You can’t change responses after you submit.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ack}
                    onChange={(e) => setAck(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-text/70 font-medium">
                    I understand I can’t edit after submit.
                  </span>
                </label>

                <motion.button
                  whileHover={{ scale: ack ? 1.02 : 1 }}
                  whileTap={{ scale: ack ? 0.98 : 1 }}
                  disabled={!ack}
                  onClick={() => router.push(`/mock-tests/${test.id}/attempt?start=1`)}
                  className={`rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm transition-all ${
                    ack
                      ? 'bg-button text-white hover:bg-button/90'
                      : 'bg-button/30 text-white/60 cursor-not-allowed'
                  }`}
                >
                  Start Test
                </motion.button>
              </div>

              <div className="mt-4 text-xs text-text/60">
                Tip: You can resume if you leave mid-test (your progress auto-saves).
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            <div className="rounded-3xl bg-white/60 border border-white/40 p-6 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-text">What to expect</div>
                  <div className="text-sm text-text/70">A clean, exam-style experience.</div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-button" />
                  <div>
                    <div className="text-sm font-semibold text-text">Timed attempt</div>
                    <div className="text-sm text-text/70">Countdown with urgency indicators.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-accent" />
                  <div>
                    <div className="text-sm font-semibold text-text">Question navigation</div>
                    <div className="text-sm text-text/70">Grid shows answered/unanswered/current.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-secondary" />
                  <div>
                    <div className="text-sm font-semibold text-text">Instant analysis</div>
                    <div className="text-sm text-text/70">Score, charts, and detailed review.</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white/70 border border-white/30 p-4">
                <div className="text-sm font-semibold text-text">Ready when you are.</div>
                <div className="text-sm text-text/70 mt-1">
                  Once you start, focus mode kicks in automatically.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MockTestsShell>
  )
}

