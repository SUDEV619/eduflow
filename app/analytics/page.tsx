
/* eslint-disable react/no-unescaped-entities */
'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { GlassCard } from './components/GlassCard'
import { StatCard } from './components/StatCard'
import { TimeFilter, type TimeFilterKey } from './components/TimeFilter'
import { THEME } from './components/theme'
import { StudyTrendsChart, SubjectDonut } from './components/Charts'
import { CircularProgress, ProgressBar } from './components/Progress'
import { ActivityHeatmap } from './components/Heatmap'
import Sidebar from '../dashboard/components/Sidebar'
import TopNavbar from '../dashboard/components/TopNavbar'
import { useAuth } from '../context/AuthContext'
import apiClient from '@/lib/apiClient'

export default function AnalyticsPage() {
  const { token } = useAuth()
  const [activeFilter, setActiveFilter] = useState<TimeFilterKey>('Weekly')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)

  const fetchAnalytics = async (range: string) => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await apiClient.get(`/api/tracker/analytics/?range=${range.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAnalytics(res.data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(activeFilter)
  }, [token, activeFilter])

  const trendData = useMemo(() => {
    if (!analytics) return []
    return analytics.study_trend.map((d: any) => {
      if (activeFilter === 'Daily') {
        return {
          label: d.label,
          hours: parseFloat((d.total / 60).toFixed(1))
        }
      }
      return {
        label: new Date(d.date).toLocaleDateString('en-US', { 
          weekday: activeFilter === 'Weekly' ? 'short' : undefined,
          day: activeFilter === 'Monthly' ? 'numeric' : undefined,
          month: activeFilter === 'Monthly' ? 'short' : undefined,
        }),
        hours: parseFloat((d.total / 60).toFixed(1))
      }
    })
  }, [analytics, activeFilter])

  const subjectData = useMemo(() => {
    if (!analytics) return []
    const colors = [THEME.primaryAccent, THEME.primaryDark, THEME.secondaryAccent, THEME.button, '#9BB8C8']
    return analytics.subject_analysis.map((s: any, idx: number) => ({
      name: s.subject_display,
      value: Math.round(s.total),
      color: colors[idx % colors.length]
    }))
  }, [analytics])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] text-[#4A465F]/40">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-sm">Calculating your progress...</p>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: THEME.bg }}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${THEME.secondaryAccent}55, ${THEME.primaryAccent}22)`,
          }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -left-40 h-[24rem] w-[24rem] rounded-full blur-3xl"
          style={{
            background: `linear-gradient(135deg, ${THEME.primaryDark}18, ${THEME.primaryAccent}14)`,
          }}
          animate={{ scale: [1, 1.12, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-secondary/10 opacity-80" />
      </div>

      <div className="flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <TopNavbar />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between py-8">
                <div>
                  <h1 className="text-4xl font-black tracking-tight" style={{ color: THEME.primaryDark }}>
                    Analytics
                  </h1>
                  <p className="mt-1 text-sm text-text/70 font-medium">
                    A clear view of your study rhythm—what's working, what's next.
                  </p>
                </div>
                {/* Time filter now functional */}
                <TimeFilter value={activeFilter} onChange={setActiveFilter} className="self-start md:self-auto" />
              </div>
            </motion.div>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ color: THEME.primaryDark }}>
                  Overview Summary
                </h2>
                <div className="hidden items-center gap-2 text-xs text-text/70 md:flex font-bold uppercase tracking-widest">
                  <Lightbulb size={14} style={{ color: THEME.primaryAccent }} />
                  Streak: {analytics.overview.streak} days and counting!
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <StatCard icon={Clock} title="Total Focus" value={analytics.overview.total_hours} unit="hrs" delay={0.05} />
                <StatCard icon={Calendar} title="Today's Session" value={Math.floor(analytics.overview.today_minutes / 60)} unit="hrs" delay={0.12} />
                <StatCard icon={TrendingUp} title={activeFilter === 'Daily' ? 'Today' : activeFilter === 'Weekly' ? 'This Week' : 'This Month'} value={analytics.overview.range_hours} unit="hrs" delay={0.19} />
                <StatCard icon={Zap} title="Focus Score" value={analytics.overview.focus_score} unit="%" delay={0.26} />
                <StatCard icon={Flame} title="Streak" value={analytics.overview.streak} unit="days" delay={0.33} />
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <GlassCard className="p-8" hover={false}>
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: THEME.primaryDark }}>
                        Study Trends
                      </h2>
                      <p className="text-sm text-text/70 font-medium">Study time across the selected period.</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 md:mt-0">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: THEME.primaryAccent }} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-text/40">Study hours</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <StudyTrendsChart data={trendData} />
                  </div>
                </GlassCard>
              </div>

              <div>
                <GlassCard className="p-8" hover={false}>
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: THEME.primaryDark }}>
                      Subject Analysis
                    </h2>
                    <p className="text-sm text-text/70 font-medium">Distribution of focus for {activeFilter.toLowerCase()} period.</p>
                  </div>

                  <div className="mt-6">
                    <SubjectDonut data={subjectData} centerLabel={{ top: `${analytics.overview.range_hours}h`, bottom: 'this period' }} />
                  </div>

                  <div className="mt-8 space-y-3">
                    {subjectData.map((s: any) => (
                      <div key={s.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                          <div className="text-sm font-bold text-text/80">{s.name}</div>
                        </div>
                        <div className="text-sm font-black" style={{ color: THEME.primaryDark }}>
                          {s.value}m
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold" style={{ color: THEME.primaryDark }}>
                  Performance Metrics
                </h2>
                <p className="text-sm text-text/70 font-medium">Insights from your mock test attempts.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <GlassCard className="p-8" hover>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl p-3" style={{ backgroundColor: `${THEME.primaryAccent}20` }}>
                      <Target size={20} style={{ color: THEME.primaryAccent }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#4A465F]">Accuracy</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-text/40">Mock tests</div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-4">
                    <CircularProgress value={Math.round(analytics.performance?.accuracy ?? 0)} label="avg accuracy" />
                    <div className="flex-1 space-y-4">
                      <ProgressBar label="Correctness" value={Math.round(analytics.performance?.accuracy ?? 0)} meta={`${Math.round(analytics.performance?.accuracy ?? 0)}%`} />
                      <ProgressBar label="Completion" value={analytics.performance?.completion_rate ?? 0} meta={`${analytics.performance?.completion_rate ?? 0}%`} />
                    </div>
                  </div>
                </GlassCard>

                {analytics.performance.subject_performances.slice(0, 2).map((sp: any, idx: number) => (
                  <GlassCard key={idx} className="p-8" hover>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl p-3" style={{ backgroundColor: `${idx === 0 ? THEARY.button : THEME.primaryDark}20` }}>
                        <Award size={20} style={{ color: idx === 0 ? THEME.button : THEME.primaryDark }} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#4A465F] capitalize">{sp.subject.replace('_', ' ')}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-text/40">Avg Accuracy</div>
                      </div>
                    </div>
                    <div className="mt-8 flex items-center justify-between gap-4">
                      <CircularProgress value={Math.round(sp.avg_accuracy ?? 0)} label="accuracy" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-text/60 leading-relaxed">
                          Your average accuracy in {sp.subject.replace('_', ' ')} mock tests. Keep focusing on core concepts to improve this score.
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold" style={{ color: THEME.primaryDark }}>
                  Insights & Suggestions
                </h2>
                <p className="text-sm text-text/70 font-medium">Actionable insights generated from your study patterns.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {analytics.insights.map((it: string, idx: number) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <GlassCard className="p-6" hover>
                      <div className="flex items-start gap-4">
                        <div
                          className="rounded-xl p-3"
                          style={{
                            backgroundColor: `${THEME.primaryAccent}20`,
                          }}
                        >
                          <Zap size={22} style={{ color: THEME.primaryAccent }} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-[#4A465F]">
                            Recommendation #{idx + 1}
                          </div>
                          <div className="mt-1 text-sm text-text/80 font-medium">{it}</div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              <GlassCard className="mt-6 p-8" hover={false}>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl p-4" style={{ backgroundColor: `${THEME.primaryAccent}16` }}>
                      <Brain size={28} style={{ color: THEME.primaryAccent }} />
                    </div>
                    <div>
                      <div className="text-lg font-black text-[#4A465F]">
                        Suggested Next Step
                      </div>
                      <div className="text-sm text-text/60 font-medium">The most impactful change you can make today.</div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl px-8 py-4 text-sm font-black text-white shadow-xl shadow-[#5EC2B7]/20 flex items-center gap-3"
                    style={{ background: `linear-gradient(135deg, ${THEME.button}, ${THEME.primaryAccent})` }}
                  >
                    <Zap size={18} />
                    {analytics.next_step}
                  </div>
                </div>
              </GlassCard>
            </section>

            <div className="mt-16 flex justify-center">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-[#4A465F]/5 shadow-sm text-xs font-bold" style={{ color: THEME.primaryDark }}>
                <BookOpen size={16} className="text-[#5EC2B7]" />
                <span className="uppercase tracking-widest opacity-60">
                  Data updated:{' '}
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const THEARY = {
    button: '#5EC2B7'
}
