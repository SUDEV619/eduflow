'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, RefreshCw, Plus, X, Loader2,
  CheckCircle, XCircle, AlertTriangle
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { materialApi, StudyMaterial } from './services/api'
import MaterialTable from './components/MaterialTable'
import UploadModal from './components/UploadModal'

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

const SUBJECTS = [
  { value: "all", label: "All Subjects" },
  { value: "quantitative_aptitude", label: "Quant" },
  { value: "general_reasoning", label: "Reasoning" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "polity", label: "Polity" },
  { value: "economy", label: "Economy" },
  { value: "general_science", label: "Science" },
  { value: "current_affairs", label: "Current Affairs" },
]

export default function StudyMaterialManagement() {
  const { token } = useAuth()

  // Data state
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null)

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    material: StudyMaterial | null
  }>({ open: false, material: null })

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── Fetch materials ────────────────────────────────────────────────────────

  const fetchMaterials = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const data = await materialApi.getMaterials(token, filterSubject, searchTerm)
      if (data.status === 'success') {
        setMaterials(data.data)
      } else {
        addToast('error', data.message || 'Failed to load materials.')
      }
    } catch (error: any) {
      console.error(error)
      addToast('error', error.message || 'Connection error.')
    } finally {
      setIsLoading(false)
    }
  }, [token, filterSubject, searchTerm, addToast])

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    fetchMaterials()
  }, [filterSubject, searchTerm, fetchMaterials])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleUploadOrUpdate = async (formData: FormData) => {
    if (!token) return
    try {
      let data
      if (editingMaterial) {
        data = await materialApi.updateMaterial(token, editingMaterial.id, formData)
      } else {
        data = await materialApi.uploadMaterial(token, formData)
      }

      if (data.status === 'success') {
        addToast('success', data.message || `Material ${editingMaterial ? 'updated' : 'uploaded'} successfully.`)
        fetchMaterials()
      } else {
        addToast('error', data.message || 'Action failed.')
      }
    } catch (error: any) {
      console.error(error)
      addToast('error', error.message || 'Connection error.')
    }
  }

  const handleDelete = async (material: StudyMaterial) => {
    if (!token) return
    setActionLoading(material.id)
    try {
      const data = await materialApi.deleteMaterial(token, material.id)
      if (data.status === 'success') {
        setMaterials((prev) => prev.filter((m) => m.id !== material.id))
        addToast('success', data.message || 'Material deleted successfully.')
      } else {
        addToast('error', data.message || 'Failed to delete material.')
      }
    } catch (error: any) {
      console.error(error)
      addToast('error', error.message || 'Connection error.')
    } finally {
      setActionLoading(null)
      setConfirmDialog({ open: false, material: null })
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <UploadModal
        open={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false)
          setEditingMaterial(null)
        }}
        onUpload={handleUploadOrUpdate}
        editingMaterial={editingMaterial}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        loading={actionLoading === confirmDialog.material?.id}
        title="Delete Material"
        message={`Are you sure you want to permanently delete "${confirmDialog.material?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmClass="bg-rose-500 hover:bg-rose-600"
        onConfirm={() => confirmDialog.material && handleDelete(confirmDialog.material)}
        onCancel={() => setConfirmDialog({ open: false, material: null })}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#4A465F] tracking-tight">Study Materials</h1>
            <p className="text-[#4A465F]/60 font-medium">
              {isLoading ? 'Loading...' : `${materials.length} total resources`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A465F]/30" />
              <input
                type="text"
                placeholder="Search materials..."
                className="pl-12 pr-4 py-3 bg-white border border-[#4A465F]/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#5EC2B7]/20 w-72 text-sm font-semibold text-[#4A465F] placeholder:font-normal transition-all"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all shadow-sm ${
                showFilters || filterSubject !== 'all'
                  ? 'bg-[#5EC2B7] text-white border-[#5EC2B7]'
                  : 'bg-white border-[#4A465F]/10 text-[#4A465F]/40 hover:text-[#5EC2B7]'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setEditingMaterial(null)
                setIsUploadModalOpen(true)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#5EC2B7] text-white rounded-2xl font-bold shadow-lg shadow-[#5EC2B7]/20 hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Upload</span>
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
              <div className="bg-white rounded-2xl border border-[#4A465F]/10 p-4 flex flex-wrap items-center gap-2 shadow-sm">
                <span className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest mr-2">Subject</span>
                {SUBJECTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFilterSubject(s.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      filterSubject === s.value
                        ? 'bg-[#5EC2B7] text-white shadow-lg shadow-[#5EC2B7]/20'
                        : 'bg-[#F5F5F5] text-[#4A465F]/40 hover:bg-[#4A465F]/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table ── */}
        <div className="bg-white rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm overflow-hidden">
          <MaterialTable
            materials={materials}
            isLoading={isLoading}
            actionLoading={actionLoading}
            onEdit={(m) => {
              setEditingMaterial(m)
              setIsUploadModalOpen(true)
            }}
            onDelete={(m) => setConfirmDialog({ open: true, material: m })}
            onClearFilters={() => {
              setSearchInput('')
              setSearchTerm('')
              setFilterSubject('all')
            }}
          />
        </div>
      </div>
    </>
  )
}
