'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, Shield, Lock, Globe, Database, Key, 
  Save, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  Plus, Trash2, Power, PowerOff, Loader2
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SystemSettings {
  system_language: string
  timezone: string
  maintenance_mode: boolean
  allow_signup: boolean
  require_strong_password: boolean
  max_login_attempts: number
  api_access_enabled: boolean
  backup_frequency: string
  storage_limit_mb: number
  auto_cleanup: boolean
}

interface APIKey {
  id: number
  name: string
  key: string
  is_active: boolean
  created_at: string
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminSettings() {
  const { token } = useAuth()
  
  // State
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'database' | 'api'>('general')
  const [toast, setToast] = useState<{ type: 'success' | 'error', msg: string } | null>(null)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchData = useCallback(async () => {
    if (!token) return
    try {
      const [setsRes, keysRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/admin/settings/', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://127.0.0.1:8000/api/admin/settings/apikeys/', { headers: { Authorization: `Bearer ${token}` } })
      ])
      
      if (setsRes.data.status === 'success') setSettings(setsRes.data.data)
      if (keysRes.data.status === 'success') setApiKeys(keysRes.data.data)
    } catch (err) {
      console.error('Fetch failed:', err)
      showToast('error', 'Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdateSettings = async () => {
    if (!settings || !token) return
    setSaving(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/admin/settings/update/', settings, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.status === 'success') {
        showToast('success', 'System settings updated successfully')
      }
    } catch (err) {
      showToast('error', 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateKey = async () => {
    if (!token) return
    try {
      const name = prompt('Enter a name for this API key:')
      if (!name) return
      
      const res = await axios.post('http://127.0.0.1:8000/api/admin/settings/apikeys/', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.status === 'success') {
        setApiKeys([...apiKeys, res.data.data])
        showToast('success', 'New API key generated')
      }
    } catch (err) {
      showToast('error', 'Failed to generate key')
    }
  }

  const handleToggleKey = async (id: number, current: boolean) => {
    if (!token) return
    try {
      const res = await axios.patch(`http://127.0.0.1:8000/api/admin/settings/apikeys/${id}/`, { is_active: !current }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.status === 'success') {
        setApiKeys(apiKeys.map(k => k.id === id ? { ...k, is_active: !current } : k))
        showToast('success', `Key ${!current ? 'activated' : 'deactivated'}`)
      }
    } catch (err) {
      showToast('error', 'Action failed')
    }
  }

  const handleDeleteKey = async (id: number) => {
    if (!token || !confirm('Permanently delete this API key?')) return
    try {
      const res = await axios.delete(`http://127.0.0.1:8000/api/admin/settings/apikeys/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.status === 'success') {
        setApiKeys(apiKeys.filter(k => k.id !== id))
        showToast('success', 'API key deleted')
      }
    } catch (err) {
      showToast('error', 'Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[#5EC2B7] animate-spin" />
        <p className="text-sm font-black text-[#4A465F]/40 uppercase tracking-widest animate-pulse">Loading System Config...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-white border-green-100 text-green-600' : 'bg-white border-rose-100 text-rose-600'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-sm font-bold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#4A465F] tracking-tighter flex items-center gap-4">
            System <span className="text-[#5EC2B7]">Control</span>
            <Settings className="w-8 h-8 text-[#5EC2B7]/20" />
          </h1>
          <p className="text-[#4A465F]/40 font-bold text-sm mt-1">Global platform configuration and security policies</p>
        </div>
        <button
          onClick={handleUpdateSettings}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-[#5EC2B7] text-white rounded-2xl font-black text-sm shadow-xl shadow-[#5EC2B7]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Apply Changes
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {[
            { id: 'general', label: 'General', icon: Globe },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'database', label: 'Maintenance', icon: Database },
            { id: 'api', label: 'API Access', icon: Key },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#4A465F] text-white shadow-lg shadow-[#4A465F]/20' 
                  : 'bg-white text-[#4A465F]/40 hover:bg-[#F5F5F5] border border-[#4A465F]/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-10 border border-[#4A465F]/5 shadow-sm min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && settings && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">System Language</label>
                    <select 
                      className="w-full px-5 py-4 bg-[#F5F5F5] rounded-2xl border-none outline-none font-bold text-[#4A465F]"
                      value={settings.system_language}
                      onChange={(e) => setSettings({ ...settings, system_language: e.target.value })}
                    >
                      <option value="en">English (US)</option>
                      <option value="hi">Hindi</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Default Timezone</label>
                    <select 
                      className="w-full px-5 py-4 bg-[#F5F5F5] rounded-2xl border-none outline-none font-bold text-[#4A465F]"
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC</option>
                      <option value="IST">Asia/Kolkata (IST)</option>
                      <option value="EST">US/Eastern (EST)</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-[#4A465F]">Maintenance Mode</h4>
                      <p className="text-xs text-[#4A465F]/60 font-medium">Block all non-admin access immediately</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                    className={`p-1 w-16 h-8 rounded-full transition-colors relative ${settings.maintenance_mode ? 'bg-rose-500' : 'bg-[#4A465F]/10'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.maintenance_mode ? 'translate-x-8' : 'translate-x-0'}`} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && settings && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {[
                  { id: 'allow_signup', label: 'Allow Public Signups', desc: 'Enable/disable new user registrations', icon: Plus },
                  { id: 'require_strong_password', label: 'Strong Passwords', desc: 'Force complex password validation', icon: Lock },
                ].map((policy) => (
                  <div key={policy.id} className="p-6 rounded-3xl border border-[#4A465F]/5 flex items-center justify-between hover:bg-[#F5F5F5]/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#5EC2B7]/10 flex items-center justify-center text-[#5EC2B7]">
                        <policy.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-[#4A465F]">{policy.label}</h4>
                        <p className="text-xs text-[#4A465F]/60 font-medium">{policy.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, [policy.id]: !(settings as any)[policy.id] })}
                      className={`p-1 w-14 h-7 rounded-full transition-colors relative ${(settings as any)[policy.id] ? 'bg-[#5EC2B7]' : 'bg-[#4A465F]/10'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${(settings as any)[policy.id] ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}

                <div className="space-y-3 pt-4">
                  <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Max Login Attempts</label>
                  <input 
                    type="number"
                    className="w-full px-5 py-4 bg-[#F5F5F5] rounded-2xl border-none outline-none font-bold text-[#4A465F]"
                    value={settings.max_login_attempts}
                    onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
                  />
                  <p className="text-[10px] text-[#4A465F]/40 font-bold ml-1 italic">Account lock after multiple failures</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'api' && settings && (
              <motion.div
                key="api"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                      <Key className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-[#4A465F]">Global API Access</h4>
                      <p className="text-xs text-[#4A465F]/60 font-medium">Enable external integration endpoints</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, api_access_enabled: !settings.api_access_enabled })}
                    className={`p-1 w-14 h-7 rounded-full transition-colors relative ${settings.api_access_enabled ? 'bg-blue-500' : 'bg-[#4A465F]/10'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.api_access_enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="text-sm font-black text-[#4A465F]/40 uppercase tracking-widest">Active API Keys</h4>
                    <button 
                      onClick={handleGenerateKey}
                      className="p-2 rounded-xl bg-[#5EC2B7]/10 text-[#5EC2B7] hover:bg-[#5EC2B7] hover:text-white transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {apiKeys.map((k) => (
                      <div key={k.id} className="p-5 rounded-3xl border border-[#4A465F]/5 flex items-center justify-between bg-white shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.is_active ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400'}`}>
                            <Key className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-[#4A465F] text-sm">{k.name}</h5>
                            <p className="text-[10px] font-mono text-[#4A465F]/40">{k.key.substring(0, 8)}••••••••••••••••••••••••••••••••</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleToggleKey(k.id, k.is_active)}
                            className={`p-2 rounded-lg transition-colors ${k.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                          >
                            {k.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => handleDeleteKey(k.id)}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'database' && settings && (
              <motion.div
                key="database"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Backup Frequency</label>
                    <select 
                      className="w-full px-5 py-4 bg-[#F5F5F5] rounded-2xl border-none outline-none font-bold text-[#4A465F]"
                      value={settings.backup_frequency}
                      onChange={(e) => setSettings({ ...settings, backup_frequency: e.target.value })}
                    >
                      <option value="daily">Every 24 Hours</option>
                      <option value="weekly">Every 7 Days</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Storage Alert (MB)</label>
                    <input 
                      type="number"
                      className="w-full px-5 py-4 bg-[#F5F5F5] rounded-2xl border-none outline-none font-bold text-[#4A465F]"
                      value={settings.storage_limit_mb}
                      onChange={(e) => setSettings({ ...settings, storage_limit_mb: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-[#4A465F]/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 shadow-sm">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-[#4A465F]">Auto-Cleanup</h4>
                      <p className="text-xs text-[#4A465F]/60 font-medium">Prune old activity logs and session data</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, auto_cleanup: !settings.auto_cleanup })}
                    className={`p-1 w-14 h-7 rounded-full transition-colors relative ${settings.auto_cleanup ? 'bg-purple-500' : 'bg-[#4A465F]/10'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.auto_cleanup ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
