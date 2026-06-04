
'use client'

import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, Users, Clock, ArrowUpRight, 
  Target, ShieldAlert, Flag, Zap, Info, Calendar,
  Activity, PieChart as PieChartIcon, BookOpen, Clock8
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts'

interface AnalyticsData {
  overview: {
    total_users: number;
    active_users_daily: number;
    active_users_weekly: number;
    total_study_hours: number;
    avg_study_time_per_user: number;
    total_tests_attempted: number;
    avg_accuracy: number;
    active_circles: number;
  };
  user_growth: Array<{ date: string; count: number }>;
  study_trends: Array<{ date: string; hours: number }>;
  subject_analysis: Array<{ subject: string; hours: number; count: number }>;
  subject_accuracy: Array<{ mock_test__subject: string; avg_score: number }>;
  peak_hours: Array<{ hour: string; count: number }>;
  circle_stats: {
    total_circles: number;
    active_circles: number;
    total_reports: number;
    most_reported: any[];
  };
  insights: string[];
}

const COLORS = ['#6FB7B4', '#4A465F', '#A8DAD6', '#FF4D4F', '#FFD166', '#5EC2B7'];

export default function AdminAnalytics() {
  const { token } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get('/api/admin/analytics/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log("Analytics Data Received:", res.data); // DEBUG
      if (res.data.status === 'success') {
        setData(res.data.data)
      } else {
        throw new Error(res.data.message || 'API returned error status')
      }
    } catch (error: any) {
      console.error("ANALYTICS FETCH ERROR:", error);
      console.error("RESPONSE DATA:", error?.response?.data);
      console.error("STATUS CODE:", error?.response?.status);

      const errorMsg = error?.response?.data?.message || error?.response?.data?.error || error.message;
      toast.error(`Failed to load analytics: ${errorMsg}`);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchAnalytics()
  }, [token])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="w-12 h-12 animate-spin text-[#6FB7B4] opacity-20" />
      </div>
    )
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#4A465F] tracking-tight">Platform <span className="text-[#6FB7B4]">Analytics</span></h1>
          <p className="text-sm font-bold text-[#4A465F]/40 uppercase tracking-widest mt-1">Deep dive into performance & behavior</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-[#4A465F] border border-[#4A465F]/10 hover:shadow-lg transition-all"
        >
          <Activity className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: data.overview.total_users, icon: Users, color: '#6FB7B4', trend: '+12% from last month' },
          { label: 'Active (Daily)', value: data.overview.active_users_daily, icon: Activity, color: '#4A465F', trend: `${data.overview.active_users_weekly} this week` },
          { label: 'Avg Accuracy', value: `${data.overview.avg_accuracy}%`, icon: Target, color: '#FF4D4F', trend: 'Based on all test attempts' },
          { label: 'Active Circles', value: data.overview.active_circles, icon: ShieldAlert, color: '#6FB7B4', trend: `${data.circle_stats.total_circles} total created` },
          { label: 'Total Reports', value: data.circle_stats.total_reports, icon: Flag, color: '#FF4D4F', trend: 'Moderation activity' },
          { label: 'Test Attempts', value: data.overview.total_tests_attempted, icon: Zap, color: '#4A465F', trend: 'System-wide engagement' },
          { label: 'Current Date', value: new Date().toLocaleDateString(), icon: Calendar, color: '#A8DAD6', trend: 'Real-time monitoring' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[2rem] p-6 border border-[#4A465F]/5 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
               <div className="p-4 rounded-2xl bg-[#F5F5F5] group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-[#4A465F]/30 tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-[#2E2E2E]">{stat.value}</p>
               </div>
            </div>
            <div className="pt-4 border-t border-[#4A465F]/5">
               <p className="text-[10px] font-bold text-[#4A465F]/40 flex items-center gap-1.5 uppercase tracking-tighter">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
               </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Trend */}
        <div className="bg-white rounded-[3rem] p-8 border border-[#4A465F]/5 shadow-sm space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#4A465F] uppercase tracking-tighter flex items-center gap-3">
                 <TrendingUp className="w-5 h-5 text-[#6FB7B4]" />
                 User Growth Trend
              </h3>
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.user_growth}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6FB7B4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6FB7B4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#4A465F10" />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 10, fontWeight: 700}} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  />
                  <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900}}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6FB7B4" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Subject Accuracy */}
        <div className="bg-white rounded-[3rem] p-8 border border-[#4A465F]/5 shadow-sm space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-[#4A465F] uppercase tracking-tighter flex items-center gap-3">
                 <Target className="w-5 h-5 text-[#FF4D4F]" />
                 Accuracy by Subject
              </h3>
           </div>
           <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.subject_accuracy}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="mock_test__subject" 
                    type="category" 
                    tick={{fontSize: 10, fontWeight: 900}} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(str) => str ? str.replace('_', ' ').substring(0, 10) + '...' : 'Unknown'}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 900}}
                  />
                  <Bar dataKey="avg_score" fill="#FF4D4F" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Smart Insights Section */}
      <div className="bg-[#4A465F] rounded-[4rem] p-12 text-white overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 transform group-hover:rotate-0 transition-transform duration-700">
            <BarChart3 className="w-64 h-64" />
         </div>
         <div className="relative z-10 space-y-10">
            <div className="space-y-4">
               <span className="px-4 py-1.5 bg-[#6FB7B4] text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  AI Generated
               </span>
               <h2 className="text-4xl font-black tracking-tight leading-none uppercase italic">Smart Platform <span className="text-[#6FB7B4]">Insights</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {data.insights.map((insight, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.5 + (idx * 0.2) }}
                   className="flex items-start gap-4"
                 >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                       <Info className="w-4 h-4 text-[#6FB7B4]" />
                    </div>
                    <p className="text-lg font-bold opacity-80 leading-relaxed italic">"{insight}"</p>
                 </motion.div>
               ))}
               {data.insights.length === 0 && (
                 <p className="text-lg font-bold opacity-40 italic">Waiting for more platform data to generate smart insights...</p>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}
