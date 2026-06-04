'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export type MockTestAttempt = {
  testId: string
  attemptId: number
  startedAt: number
  submittedAt?: number
  answers: Record<string, number>
  lastActiveQuestionIndex: number
}

const STORAGE_PREFIX = 'eduflow:mock-test-attempt'

export default function useMockTestAttempt(testId: string) {
  const storageKey = useMemo(() => `${STORAGE_PREFIX}:${testId}`, [testId])
  const [attempt, setAttempt] = useState<MockTestAttempt | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) {
        setAttempt(null)
        return
      }
      const parsed = JSON.parse(raw) as MockTestAttempt
      if (parsed.testId !== testId) setAttempt(null)
      else setAttempt(parsed)
    } catch {
      setAttempt(null)
    } finally {
      setIsHydrated(true)
    }
  }, [storageKey, testId])

  useEffect(() => {
    if (!isHydrated) return
    try {
      if (!attempt) {
        localStorage.removeItem(storageKey)
        return
      }
      localStorage.setItem(storageKey, JSON.stringify(attempt))
    } catch {
      // Ignore storage write errors (e.g., blocked cookies).
    }
  }, [attempt, isHydrated, storageKey])

  const startNewAttempt = useCallback((attemptId: number) => {
    setAttempt({
      testId,
      attemptId,
      startedAt: Date.now(),
      answers: {},
      lastActiveQuestionIndex: 0,
    })
  }, [testId])

  const resetAttempt = useCallback(() => {
    setAttempt(null)
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // ignore
    }
  }, [storageKey])

  const submitAttempt = useCallback(() => {
    setAttempt((prev) => {
      if (!prev) return prev
      if (prev.submittedAt) return prev
      return { ...prev, submittedAt: Date.now() }
    })
  }, [])

  const setAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAttempt((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: optionIndex,
        },
      }
    })
  }, [])

  const setLastActiveQuestionIndex = useCallback((index: number) => {
    setAttempt((prev) => {
      if (!prev) return prev
      return { ...prev, lastActiveQuestionIndex: index }
    })
  }, [])

  return {
    attempt,
    isHydrated,
    startNewAttempt,
    resetAttempt,
    submitAttempt,
    setAnswer,
    setLastActiveQuestionIndex,
  }
}

