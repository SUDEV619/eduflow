'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, BookOpen, Clock, ShieldAlert, BarChart3, 
  Activity, Plus, Upload, Bell, ChevronRight, AlertTriangle,
  Flame, CheckCircle, ExternalLink, RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  overview: {
    total_users: number
    active_users: number
    total_study_hours: number
    total_circles: number
    total_materials: number
    total_reports: number
  }
  alerts: {
    recent_reports: Array<{
      id: number
      reporter: string
      reason: string
      circle_name: string
      created_at: string
    }>
    flagged_circles_count: number
  }
  materials: {
    recent: any[]
    trending: any[]
  }
  circles: {
    recent: any[]
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  console.log("Admin Dashboard Component Rendering");
  
  const { token } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    if (!token) {
      console.log("No token available yet");
      return
    }
    
    setLoading(true)
    setError(null)
    console.log("Fetching dashboard data from: http://127.0.0.1:8000/api/admin/stats/");
    
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/admin/stats/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log("API Response:", res.data);
      
      if (res.data.status === 'success') {
        setData(res.data.data)
      } else {
        setError(res.data.message || "Failed to fetch dashboard data")
      }
    } catch (err: any) {
      console.error('Dashboard fetch failed:', err)
      setError(err.response?.data?.message || err.message || "Connection error. Please ensure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#5EC2B7]/20 border-t-[#5EC2B7] rounded-full animate-spin" />
        <p className="text-sm font-black text-[#4A465F]/40 uppercase tracking-widest animate-pulse">Initializing Control Hub...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <h3 className="text-2xl font-black text-[#4A465F] mb-2">Operation Failed</h3>
        <p className="text-sm text-[#4A465F]/40 font-bold max-w-md mb-8">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-8 py-4 bg-[#4A465F] text-white rounded-[1.5rem] font-black text-sm shadow-xl hover:scale-105 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-sm text-[#4A465F]/40 font-bold">No dashboard data available.</p>
      </div>
    )
  }

  const stats = [
    { label: 'Total Users', value: data.overview?.total_users ?? 0, icon: Users, color: 'blue', href: '/admin/users' },
    { label: 'Active Today', value: data.overview?.active_users ?? 0, icon: Activity, color: 'green', href: '/admin/users' },
    { label: 'Study Circles', value: data.overview?.total_circles ?? 0, icon: ShieldAlert, color: 'orange', href: '/admin/study-circles' },
    { label: 'Resources', value: data.overview?.total_materials ?? 0, icon: BookOpen, color: 'teal', href: '/admin/study-materials' },
    { label: 'Reports', value: data.overview?.total_reports ?? 0, icon: AlertTriangle, color: 'rose', href: '/admin/study-circles', critical: (data.overview?.total_reports ?? 0) > 0 },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#4A465F] tracking-tighter">Command <span className="text-[#5EC2B7]">Center</span></h1>
          <p className="text-[#4A465F]/40 font-bold text-sm mt-1">Platform overview and real-time operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-2xl border border-[#4A465F]/5 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-[#4A465F]/60 uppercase tracking-widest">Live Platform Stats</span>
          </div>
        </div>
      </div>

      {/* 1. Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, i) => (
          <Link href={stat.href} key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className={`bg-white p-6 rounded-[2rem] border transition-all shadow-sm flex flex-col gap-4 group ${
                stat.critical ? 'border-rose-100 bg-rose-50/30' : 'border-[#4A465F]/5'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                stat.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                stat.color === 'green' ? 'bg-green-50 text-green-500' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-500' :
                stat.color === 'orange' ? 'bg-orange-50 text-orange-500' :
                stat.color === 'teal' ? 'bg-teal-50 text-teal-500' :
                'bg-rose-50 text-rose-500'
              }`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#4A465F] tracking-tight">{stat.value.toLocaleString()}</div>
                <div className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* 2. Alerts and Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Alerts / Action Required */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#4A465F] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Action Required
            </h2>
            <Link href="/admin/study-circles" className="text-xs font-black text-[#5EC2B7] uppercase tracking-widest hover:underline">View All Reports</Link>
          </div>
          
          <div className="space-y-4">
            {data.alerts?.recent_reports?.length > 0 ? (
              data.alerts.recent_reports.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-[1.5rem] border border-rose-100 flex items-center justify-between group hover:shadow-lg hover:shadow-rose-500/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#4A465F]">Report in "{alert.circle_name}"</h4>
                      <p className="text-xs text-[#4A465F]/60 font-medium">Reason: {alert.reason}</p>
                    </div>
                  </div>
                  <Link href={`/admin/study-circles`} className="p-2 rounded-lg bg-[#F5F5F5] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-[#4A465F]/40" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-[2rem] border border-[#4A465F]/5 text-center">
                <div className="w-16 h-16 rounded-3xl bg-green-50 flex items-center justify-center mx-auto mb-4 text-green-500">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-[#4A465F]">System Secure</h3>
                <p className="text-sm text-[#4A465F]/40 font-medium">No pending reports require your attention.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-[#4A465F] px-2">Quick Operations</h2>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Upload Material', icon: Upload, href: '/admin/study-materials', color: 'teal' },
              { label: 'New Mock Test', icon: Plus, href: '/admin/mock-tests', color: 'blue' },
              { label: 'Bulk Questions', icon: BookOpen, href: '/admin/questions', color: 'purple' },
              { label: 'Send Announcement', icon: Bell, href: '/admin/notifications', color: 'orange' },
              { label: 'System Analytics', icon: BarChart3, href: '/admin/analytics', color: 'slate' },
            ].map((action, i) => (
              <Link href={action.href} key={i}>
                <button className="w-full bg-white p-5 rounded-[1.5rem] border border-[#4A465F]/5 flex items-center justify-between group hover:border-[#5EC2B7]/30 hover:bg-[#5EC2B7]/5 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                      action.color === 'teal' ? 'bg-teal-50 text-teal-500' :
                      action.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                      action.color === 'purple' ? 'bg-purple-50 text-purple-500' :
                      action.color === 'orange' ? 'bg-orange-50 text-orange-500' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-[#4A465F]">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#4A465F]/20 group-hover:text-[#5EC2B7] group-hover:translate-x-1 transition-all" />
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Resource Snapshots */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Materials */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#4A465F] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5EC2B7]" />
              Recent Resources
            </h2>
            <Link href="/admin/study-materials" className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest hover:text-[#5EC2B7]">Manage Hub</Link>
          </div>
          <div className="bg-white rounded-[2rem] border border-[#4A465F]/5 overflow-hidden shadow-sm">
            <div className="divide-y divide-[#4A465F]/5">
              {data.materials?.recent?.map((m: any) => (
                <div key={m.id} className="p-5 flex items-center justify-between hover:bg-[#F5F5F5]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#5EC2B7]/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-[#5EC2B7]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#4A465F] line-clamp-1">{m.title}</h4>
                      <p className="text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">{m.subject_display}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A465F]/40">
                    <Activity className="w-3 h-3" />
                    <span className="text-xs font-bold">{m.download_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Materials */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#4A465F] flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Trending Resources
            </h2>
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Top Performers</span>
          </div>
          <div className="bg-white rounded-[2rem] border border-[#4A465F]/5 overflow-hidden shadow-sm">
            <div className="divide-y divide-[#4A465F]/5">
              {data.materials?.trending?.map((m: any) => (
                <div key={m.id} className="p-5 flex items-center justify-between hover:bg-[#F5F5F5]/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#4A465F] line-clamp-1">{m.title}</h4>
                      <p className="text-[10px] font-black text-[#4A465F]/30 uppercase tracking-widest">{m.subject_display}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#4A465F]/40">
                    <Activity className="w-3 h-3" />
                    <span className="text-xs font-bold">{m.download_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
