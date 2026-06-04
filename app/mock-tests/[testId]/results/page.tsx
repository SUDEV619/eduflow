'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Target, RotateCcw, Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts'
import MockTestsShell from '../../components/MockTestsShell'
import { userMockTestApi, MockTest } from '../../lib/api'
import useMockTestAttempt from '../../components/testAttempt/useMockTestAttempt'
import { useAuth } from '../../../context/AuthContext'

const fmtSeconds = (sec: number) => {
  const s = Math.max(0, Math.floor(sec))
  const mm = Math.floor(s / 60)
  const ss = s % 60
  return `${mm}m ${ss}s`
}

export default function MockTestResultsPage() {
  const params = useParams<{ testId: string }>()
  const router = useRouter()
  const { token } = useAuth()

  const testId = Array.isArray(params.testId) ? params.testId[0] : params.testId
  
  const [test, setTest] = useState<MockTest | null>(null)
  const [isLoadingTest, setIsLoadingTest] = useState(true)

  const fetchTest = useCallback(async () => {
    if (!testId) return
    setIsLoadingTest(true)
    try {
      const data = await userMockTestApi.getMockTestDetail(testId, token || undefined)
      setTest(data)
    } catch (err) {
      console.error('Failed to fetch test for results:', err)
    } finally {
      setIsLoadingTest(false)
    }
  }, [testId, token])

  useEffect(() => {
    fetchTest()
  }, [fetchTest])

  const { attempt, isHydrated } = useMockTestAttempt(testId ?? '')

  const stats = useMemo(() => {
    if (!test || !attempt || !attempt.submittedAt) return null

    const total = test.questions.length
    let correct = 0
    let incorrect = 0
    let unanswered = 0

    for (const q of test.questions) {
      const selected = attempt.answers[String(q.id)]
      if (selected === undefined) {
        unanswered += 1
        continue
      }
      if (selected === q.correctOptionIndex) correct += 1
      else incorrect += 1
    }

    const scorePoints =
      correct * test.marking.correctPoints +
      incorrect * test.marking.incorrectPoints +
      unanswered * test.marking.unansweredPoints

    const accuracyPct = total === 0 ? 0 : Math.round((correct / total) * 100)

    const timeTakenSec = Math.max(0, Math.floor((attempt.submittedAt - attempt.startedAt) / 1000))

    return {
      total,
      correct,
      incorrect,
      unanswered,
      scorePoints,
      accuracyPct,
      timeTakenSec,
    }
  }, [attempt, test])

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!stats) return
    const start = 0
    const end = Math.max(0, stats.scorePoints)
    const durationMs = 900
    const t0 = performance.now()

    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs)
      const v = Math.round(start + (end - start) * p)
      setDisplayScore(v)
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [stats])

  const accent = '#6FB7B4'
  const button = '#5EC2B7'
  const secondary = '#A8DAD6'

  if (isLoadingTest || !isHydrated) {
    return (
      <MockTestsShell>
        <div className="p-20 flex flex-col items-center justify-center text-text/40">
          <Loader2 className="w-10 h-10 animate-spin mb-4" />
          <p className="font-bold">Loading results...</p>
        </div>
      </MockTestsShell>
    )
  }

  if (!test) {
    return (
      <MockTestsShell>
        <div className="p-6 text-text font-semibold">Mock test not found.</div>
      </MockTestsShell>
    )
  }

  if (!stats) {
    return (
      <MockTestsShell>
        <div className="p-6">
          <div className="rounded-3xl bg-white/80 border border-white/40 p-6 shadow-sm">
            <div className="text-text font-semibold text-lg">No submitted attempt found.</div>
            <div className="text-sm text-text/70 mt-2">Start a test to see results and analysis.</div>
            <div className="mt-5 flex gap-3 flex-wrap">
              <button
                className="rounded-2xl px-5 py-3 bg-button text-white font-semibold hover:bg-button/90 transition-colors"
                onClick={() => router.push(`/mock-tests/${test.id}/instructions`)}
              >
                Start Test
              </button>
              <button
                className="rounded-2xl px-5 py-3 bg-white/60 border border-white/40 text-text font-semibold hover:bg-white/80 transition-colors"
                onClick={() => router.push('/mock-tests')}
              >
                Back to Tests
              </button>
            </div>
          </div>
        </div>
      </MockTestsShell>
    )
  }

  const barData = [
    { name: 'Correct', value: stats.correct, fill: accent },
    { name: 'Incorrect', value: stats.incorrect, fill: button },
  ]

  const pieData = [
    { name: 'Correct', value: stats.correct, fill: accent },
    { name: 'Incorrect', value: stats.incorrect, fill: button },
    { name: 'Unanswered', value: stats.unanswered, fill: secondary },
  ]

  return (
    <MockTestsShell>
      <div className="p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-button/15 border border-button/25 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-button" />
                </div>
                <h1 className="text-2xl font-bold text-text">Results & Analysis</h1>
              </div>
              <p className="mt-2 text-sm text-text/70">{test.title}</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                className="rounded-2xl px-4 py-2.5 bg-button text-white font-semibold hover:bg-button/90 transition-colors shadow-sm inline-flex items-center gap-2"
                onClick={() => router.push(`/mock-tests/${test.id}/attempt?start=1`)}
              >
                <RotateCcw className="w-4 h-4" />
                Retake
              </button>
              <button
                className="rounded-2xl px-4 py-2.5 bg-white/60 border border-white/40 text-text font-semibold hover:bg-white/80 transition-colors"
                onClick={() => router.push('/mock-tests')}
              >
                Back
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="lg:col-span-1 rounded-3xl bg-button/15 border border-button/30 p-6 shadow-sm"
          >
            <div className="text-xs font-semibold uppercase tracking-wide text-text/60">Score</div>
            <div className="mt-3 text-4xl font-extrabold text-text">
              {displayScore}
              <span className="text-base font-bold text-text/60"> pts</span>
            </div>
            <div className="mt-2 text-sm text-text/70">
              Accuracy: <span className="font-semibold text-text">{stats.accuracyPct}%</span>
            </div>
            <div className="mt-4 rounded-2xl bg-white/60 border border-white/30 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text/70">Time taken</span>
                <span className="text-sm font-semibold text-text">{fmtSeconds(stats.timeTakenSec)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-text/70">Total questions</span>
                <span className="text-sm font-semibold text-text">{stats.total}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="lg:col-span-2 rounded-3xl bg-white/70 border border-white/40 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="text-lg font-bold text-text">Performance Charts</div>
                  <div className="text-sm text-text/70">Correct vs incorrect • Accuracy breakdown</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid md:grid-cols-2 gap-5">
              <div className="rounded-3xl bg-background/50 border border-white/40 p-4">
                <div className="text-sm font-semibold text-text">Bar Chart</div>
                <div className="h-56 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <Tooltip />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]} isAnimationActive>
                        {barData.map((d) => (
                          <Cell key={d.name} fill={d.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl bg-background/50 border border-white/40 p-4">
                <div className="text-sm font-semibold text-text">Pie Chart</div>
                <div className="h-56 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Tooltip />
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={45}
                        label
                        isAnimationActive
                      >
                        {pieData.map((d) => (
                          <Cell key={d.name} fill={d.fill} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="rounded-3xl bg-white/70 border border-white/40 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-lg font-bold text-text">Question Review</div>
              <div className="text-sm text-text/70 mt-1">
                See your answer, the correct answer, and the explanation.
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {test.questions.map((q, idx) => {
              const selected = attempt?.answers[String(q.id)]
              const isAnswered = selected !== undefined
              const isCorrect = isAnswered && selected === q.correctOptionIndex
              const status = !isAnswered ? 'Unanswered' : isCorrect ? 'Correct' : 'Incorrect'

              const statusClass = !isAnswered
                ? 'bg-secondary/25 text-secondary border-secondary/40'
                : isCorrect
                  ? 'bg-accent/20 text-accent border-accent/40'
                  : 'bg-button/20 text-button border-button/40'

              const expandedOpen = !!expanded[String(q.id)]

              return (
                <div key={q.id} className="rounded-3xl bg-background/40 border border-white/40 overflow-hidden">
                  <button
                    className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
                    onClick={() => setExpanded((prev) => ({ ...prev, [String(q.id)]: !prev[String(q.id)] }))}
                  >
                    <div>
                      <div className="text-sm font-semibold text-text">
                        Q{idx + 1}: {q.prompt}
                      </div>
                      <div className="mt-2 text-xs text-text/60">
                        {isAnswered ? 'Answered' : 'No answer submitted'}
                      </div>
                    </div>
                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}>
                      {status}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 pt-2 grid md:grid-cols-2 gap-4">
                          <div className="rounded-2xl bg-white/60 border border-white/30 p-4">
                            <div className="text-sm font-semibold text-text">Your answer</div>
                            <div className="mt-2 text-sm text-text/70">
                              {isAnswered ? q.options[selected].label : 'Unanswered'}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-white/60 border border-white/30 p-4">
                            <div className="text-sm font-semibold text-text">Correct answer</div>
                            <div className="mt-2 text-sm text-text/70">
                              {q.options[q.correctOptionIndex].label}
                            </div>
                          </div>
                          <div className="md:col-span-2 rounded-2xl bg-white/60 border border-white/30 p-4">
                            <div className="text-sm font-semibold text-text">Explanation</div>
                            <div className="mt-2 text-sm text-text/70">{q.explanation}</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </MockTestsShell>
  )
}

