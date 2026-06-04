'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { StudyMaterial } from '../services/api'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onUpload: (formData: FormData) => Promise<void>
  editingMaterial: StudyMaterial | null
}

const SUBJECT_CHOICES = [
  { value: "quantitative_aptitude", label: "Quantitative Aptitude" },
  { value: "general_reasoning", label: "General Reasoning" },
  { value: "english", label: "English" },
  { value: "history", label: "History" },
  { value: "geography", label: "Geography" },
  { value: "polity", label: "Polity" },
  { value: "economy", label: "Economy" },
  { value: "general_science", label: "General Science" },
  { value: "current_affairs", label: "Current Affairs" },
]

export default function UploadModal({ open, onClose, onUpload, editingMaterial }: UploadModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'quantitative_aptitude',
    tags: '',
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    if (editingMaterial) {
      setFormData({
        title: editingMaterial.title,
        description: editingMaterial.description,
        subject: editingMaterial.subject,
        tags: editingMaterial.tags,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        subject: 'quantitative_aptitude',
        tags: '',
      })
      setFile(null)
    }
  }, [editingMaterial, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('subject', formData.subject)
      data.append('tags', formData.tags)
      if (file) data.append('file', file)
      
      await onUpload(data)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-2xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-[#4A465F]">
                {editingMaterial ? 'Edit Material' : 'Upload Material'}
              </h3>
              <p className="text-sm text-[#4A465F]/40 font-medium">Fill in the details below</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[#F5F5F5] transition-colors">
              <X className="w-6 h-6 text-[#4A465F]/40" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Title</label>
              <input
                required
                type="text"
                placeholder="Enter material title..."
                className="w-full px-5 py-4 bg-[#F5F5F5] border-none rounded-2xl focus:ring-4 focus:ring-[#5EC2B7]/20 text-sm font-bold text-[#4A465F] placeholder:font-normal outline-none transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Subject</label>
                <select
                  className="w-full px-5 py-4 bg-[#F5F5F5] border-none rounded-2xl focus:ring-4 focus:ring-[#5EC2B7]/20 text-sm font-bold text-[#4A465F] outline-none transition-all appearance-none cursor-pointer"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  {SUBJECT_CHOICES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Tags</label>
                <input
                  type="text"
                  placeholder="e.g. PDF, Notes..."
                  className="w-full px-5 py-4 bg-[#F5F5F5] border-none rounded-2xl focus:ring-4 focus:ring-[#5EC2B7]/20 text-sm font-bold text-[#4A465F] placeholder:font-normal outline-none transition-all"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Description</label>
              <textarea
                placeholder="Brief description of the material..."
                className="w-full px-5 py-4 bg-[#F5F5F5] border-none rounded-2xl focus:ring-4 focus:ring-[#5EC2B7]/20 text-sm font-bold text-[#4A465F] placeholder:font-normal outline-none transition-all min-h-[100px] resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">
                File {editingMaterial ? '(Optional)' : '(Required)'}
              </label>
              <div className="relative">
                <input
                  required={!editingMaterial}
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center gap-3 w-full px-5 py-4 bg-[#F5F5F5] border-2 border-dashed border-[#4A465F]/10 rounded-2xl cursor-pointer hover:bg-[#4A465F]/5 transition-all"
                >
                  <div className="p-2 rounded-lg bg-white shadow-sm text-[#5EC2B7]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-[#4A465F]/60">
                    {file ? file.name : editingMaterial ? 'Change file...' : 'Choose a file...'}
                  </span>
                </label>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#5EC2B7] text-white font-bold shadow-lg shadow-[#5EC2B7]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {editingMaterial ? 'Update Material' : 'Upload Material'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
