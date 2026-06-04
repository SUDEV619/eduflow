
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
  X, Loader2
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { adminApi, User, PaginationData } from './services/api'
import UserTable from './components/UserTable'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

// ─── Toast ───────────────────────────────────────────────────────────────────

interface Toast {
  id: number
  type: 'success' | 'error'
  message: string
}

let toastIdCounter = 0

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold min-w-[280px] ${
              t.type === 'success'
                ? 'bg-white border-green-100 text-green-700'
                : 'bg-white border-rose-100 text-rose-700'
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              : <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            }
            <span className="flex-1">{t.message}</span>
            <button onClick={() => onRemove(t.id)} className="opacity-40 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  confirmClass: string
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ open, title, message, confirmLabel, confirmClass, loading, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-rose-50">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
            </div>
            <h3 className="text-lg font-black text-[#4A465F]">{title}</h3>
          </div>
          <p className="text-sm text-[#4A465F]/60 font-medium mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl bg-[#F5F5F5] text-[#4A465F]/60 font-bold text-sm hover:bg-[#4A465F]/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 ${confirmClass} disabled:opacity-60`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserManagement() {
  const { token } = useAuth()

  // Data state
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    total_pages: 1,
    count: 0
  })

  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    type: 'delete' | 'toggle' | null
    user: User | null
  }>({ open: false, type: null, user: null })

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Fetch users ────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async (page = 1) => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await adminApi.getUsers(token, searchTerm, filterStatus, page)

      if (data.status === 'success') {
        setUsers(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
        }
      } else {
        addToast('error', data.message || 'Failed to load users.')
      }
    } catch (error: any) {
      console.error(error)
      addToast('error', error.message || 'Connection error. Is the backend running?')
    } finally {
      setIsLoading(false)
    }
  }, [token, searchTerm, filterStatus, addToast])

  // ── Effects ────────────────────────────────────────────────────────────────

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  // Fetch on filter change
  useEffect(() => {
    fetchUsers(1)
  }, [searchTerm, filterStatus, fetchUsers])

  // ── Toggle status ──────────────────────────────────────────────────────────

  const handleToggleStatus = async (user: User) => {
    if (!token) return
    setActionLoading(user.id)
    try {
      const data = await adminApi.updateUserStatus(token, user.id, !user.is_active)
      if (data.status === 'success') {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
        addToast('success', data.message || `User ${!user.is_active ? 'activated' : 'deactivated'} successfully.`)
      } else {
        addToast('error', data.message || 'Failed to update status.')
      }
    } catch (error: any) {
      console.error(error)
      addToast('error', error.message || 'Connection error.')
    } finally {
      setActionLoading(null)
      setConfirmDialog({ open: false, type: null, user: null })
    }
  }

  // ── Delete user ────────────────────────────────────────────────────────────

  const handleDeleteUser = async (user: User) => {
    if (!token) return
    setActionLoading(user.id)
    try {
      const data = await adminApi.deleteUser(token, user.id)
      if (data.status === 'success') {
        setUsers((prev) => prev.filter((u) => u.id !== user.id))
        setPagination(prev => ({ ...prev, count: prev.count - 1 }))
        addToast('success', data.message || 'User deleted successfully.')
      } else {
        addToast('error', data.message || 'Failed to delete user.')
      }
    } catch (error: any) {
      console.error(error)
      addToast('error', error.message || 'Connection error.')
    } finally {
      setActionLoading(null)
      setConfirmDialog({ open: false, type: null, user: null })
    }
  }

  // ── Page change ────────────────────────────────────────────────────────────

  const handlePageChange = (page: number) => {
    fetchUsers(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmDialog
        open={confirmDialog.open}
        loading={actionLoading === confirmDialog.user?.id}
        title={
          confirmDialog.type === 'delete'
            ? 'Delete User'
            : confirmDialog.user?.is_active ? 'Deactivate User' : 'Activate User'
        }
        message={
          confirmDialog.type === 'delete'
            ? `Are you sure you want to permanently delete "${confirmDialog.user?.name}"? This action cannot be undone.`
            : confirmDialog.user?.is_active
            ? `Deactivating "${confirmDialog.user?.name}" will prevent them from logging in. You can reactivate them later.`
            : `Reactivating "${confirmDialog.user?.name}" will restore their access to EduFlow.`
        }
        confirmLabel={
          confirmDialog.type === 'delete'
            ? 'Delete'
            : confirmDialog.user?.is_active ? 'Deactivate' : 'Activate'
        }
        confirmClass={
          confirmDialog.type === 'delete'
            ? 'bg-rose-500 hover:bg-rose-600'
            : confirmDialog.user?.is_active
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-green-500 hover:bg-green-600'
        }
        onConfirm={() => {
          if (!confirmDialog.user) return
          if (confirmDialog.type === 'delete') handleDeleteUser(confirmDialog.user)
          else handleToggleStatus(confirmDialog.user)
        }}
        onCancel={() => setConfirmDialog({ open: false, type: null, user: null })}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#4A465F] tracking-tight">User Management</h1>
            <p className="text-[#4A465F]/60 font-medium">
              {isLoading ? 'Loading...' : `${pagination.count.toLocaleString()} total members`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/30" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="pl-12 pr-4 py-3 bg-white border border-[#4A465F]/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5EC2B7]/20 w-72 text-sm font-semibold text-[#4A465F] placeholder:font-normal transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setSearchTerm('') }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A465F]/30 hover:text-[#4A465F] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all shadow-sm ${
                showFilters || filterStatus !== 'all'
                  ? 'bg-[#5EC2B7] text-white border-[#5EC2B7]'
                  : 'bg-white border-[#4A465F]/10 text-[#4A465F]/40 hover:text-[#5EC2B7]'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            {/* Refresh */}
            <button
              onClick={() => fetchUsers(pagination.page)}
              disabled={isLoading}
              className="p-3 bg-white rounded-2xl border border-[#4A465F]/10 text-[#4A465F]/40 hover:text-[#5EC2B7] transition-all shadow-sm disabled:opacity-40"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl border border-[#4A465F]/10 p-4 flex items-center gap-3 shadow-sm">
                <span className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest mr-2">Status</span>
                {(['all', 'active', 'inactive']).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      filterStatus === s
                        ? s === 'all'
                          ? 'bg-[#5EC2B7] text-white shadow-lg shadow-[#5EC2B7]/20'
                          : s === 'active'
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                          : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-[#F5F5F5] text-[#4A465F]/40 hover:bg-[#4A465F]/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ── */}
        <div className="bg-white rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm overflow-hidden">
          <UserTable
            users={users}
            isLoading={isLoading}
            actionLoading={actionLoading}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            onToggleStatus={(user) => setConfirmDialog({ open: true, type: 'toggle', user })}
            onDelete={(user) => setConfirmDialog({ open: true, type: 'delete', user })}
            onClearFilters={() => { setSearchInput(''); setSearchTerm(''); setFilterStatus('all') }}
          />

          {/* ── Pagination ── */}
          {!isLoading && pagination.total_pages > 0 && (
            <div className="px-8 py-5 bg-[#F5F5F5]/30 border-t border-[#4A465F]/5 flex items-center justify-between">
              <p className="text-xs font-bold text-[#4A465F]/40">
                Page {pagination.page} of {pagination.total_pages} · {pagination.count.toLocaleString()} users
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="p-2 rounded-lg bg-white border border-[#4A465F]/10 text-[#4A465F]/40 hover:text-[#5EC2B7] hover:border-[#5EC2B7]/30 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(pagination.total_pages, 5) }, (_, i) => {
                  const p = pagination.total_pages <= 5 ? i + 1 : Math.max(1, pagination.page - 2) + i
                  if (p > pagination.total_pages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                        p === pagination.page
                          ? 'bg-[#5EC2B7] text-white shadow-lg shadow-[#5EC2B7]/20'
                          : 'bg-white border border-[#4A465F]/10 text-[#4A465F]/50 hover:border-[#5EC2B7]/30 hover:text-[#5EC2B7]'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}

                <button
                  disabled={pagination.page >= pagination.total_pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="p-2 rounded-lg bg-white border border-[#4A465F]/10 text-[#4A465F]/40 hover:text-[#5EC2B7] hover:border-[#5EC2B7]/30 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
