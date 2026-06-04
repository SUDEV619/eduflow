
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Loader2, 
  Plus, 
  X,
  File
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import apiClient from '@/lib/apiClient'

interface Resource {
  id: number
  title: string
  file: string
  uploaded_by_name: string
  created_at: string
}

export default function ResourceVault({ circleId }: { circleId: string }) {
  const { token, user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  const [uploadData, setUploadData] = useState({
    title: '',
    file: null as File | null
  })

  const fetchResources = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await apiClient.get(`/api/circles/${circleId}/resources/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResources(res.data)
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [circleId, token])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadData.title || !uploadData.file || !token) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('title', uploadData.title)
      formData.append('file', uploadData.file)
      formData.append('circle', circleId)

      await apiClient.post(`/api/circles/${circleId}/resources/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      
      setShowUploadModal(false)
      setUploadData({ title: '', file: null })
      fetchResources()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload resource.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?') || !token) return
    try {
      await apiClient.delete(`/api/circles/resources/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setResources(prev => prev.filter(r => r.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete resource.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-[#4A465F]/20">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-bold">Loading vault...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-[#4A465F]">Resource Vault</h3>
          <p className="text-sm text-[#4A465F]/40 font-medium">Download or share study materials</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-[#5EC2B7] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#5EC2B7]/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Upload Material
        </motion.button>
      </div>

      {resources.length === 0 ? (
        <div className="bg-[#F5F5F5]/50 border-2 border-dashed border-[#4A465F]/5 rounded-3xl p-20 text-center">
          <FileText className="w-12 h-12 text-[#4A465F]/10 mx-auto mb-4" />
          <p className="font-bold text-[#4A465F]/40">No resources shared yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-3xl border border-[#4A465F]/5 shadow-sm group transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-[#F5F5F5] group-hover:bg-[#5EC2B7]/10 transition-colors">
                  <File className="w-6 h-6 text-[#5EC2B7]" />
                </div>
                <button 
                  onClick={() => handleDelete(res.id)}
                  className="p-2 text-[#4A465F]/10 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-bold text-[#4A465F] mb-1 line-clamp-1">{res.title}</h4>
              <p className="text-[10px] font-bold text-[#4A465F]/30 uppercase tracking-widest mb-6">
                By {res.uploaded_by_name} • {new Date(res.created_at).toLocaleDateString()}
              </p>

              <button 
                onClick={() => window.open(res.file, '_blank')}
                className="w-full py-3 bg-[#4A465F] text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#2E2E2E] transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isUploading && setShowUploadModal(false)}
              className="absolute inset-0 bg-[#2E2E2E]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-[#4A465F]">Upload Material</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-[#4A465F]/20 hover:text-[#4A465F]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">Document Title</label>
                  <input 
                    type="text" 
                    required
                    value={uploadData.title}
                    onChange={e => setUploadData({...uploadData, title: e.target.value})}
                    placeholder="e.g. Physics Formula Sheet"
                    className="w-full px-6 py-4 bg-[#F5F5F5] rounded-2xl focus:outline-none focus:ring-2 ring-[#5EC2B7]/20 font-bold text-[#4A465F]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest ml-1">File</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      required
                      onChange={e => setUploadData({...uploadData, file: e.target.files?.[0] || null})}
                      className="hidden"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full p-8 bg-[#F5F5F5] border-2 border-dashed border-[#4A465F]/5 rounded-2xl cursor-pointer hover:bg-[#F5F5F5]/80 transition-all"
                    >
                      {uploadData.file ? (
                        <div className="text-center">
                          <CheckCircle className="w-8 h-8 text-[#5EC2B7] mx-auto mb-2" />
                          <p className="font-bold text-xs text-[#4A465F] truncate max-w-[200px]">{uploadData.file.name}</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Plus className="w-8 h-8 text-[#4A465F]/20 mx-auto mb-2" />
                          <p className="font-bold text-xs text-[#4A465F]/40 uppercase tracking-widest">Click to select file</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUploading || !uploadData.file || !uploadData.title}
                  className="w-full py-4 bg-[#5EC2B7] text-white rounded-2xl font-black shadow-xl shadow-[#5EC2B7]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {isUploading ? 'Uploading...' : 'Start Upload'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

import { CheckCircle } from 'lucide-react'
