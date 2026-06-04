
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, FileText, CheckCircle, XCircle, AlertCircle, 
  ChevronLeft, Download, Loader2, Info
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { adminApi } from '../../mock-tests/services/api'
import { standardizedSubjects } from '../../components/SubjectFilter'
import Link from 'next/link'

export default function CSVUpload() {
  const { token } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ success_count: number; failed_rows: { row: number; error: string }[] } | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
        setResult(null)
      } else {
        alert('Please upload a valid CSV file.')
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !token) {
      alert("No file selected")
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds limit (5MB)")
      return;
    }

    setIsUploading(true)
    try {
      const res = await adminApi.uploadCSV(token, file)
      if (res.status === 'success') {
        setResult(res.data)
      } else {
        alert(res.message || 'Upload failed')
      }
    } catch (error: any) {
      console.error("UPLOAD ERROR:", error)
      alert(error.message || 'An unexpected error occurred during upload.')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "question,option_a,option_b,option_c,option_d,correct_option,subject,topic,difficulty,marks,explanation\n" +
      "What is 2+2?,1,2,3,4,D,quantitative_aptitude,Arithmetic,Easy,1,2+2 is 4 which is option D"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions_template.csv'
    a.click()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/questions" className="p-3 bg-white rounded-2xl border border-[#4A465F]/10 hover:bg-[#F5F5F5] transition-all">
          <ChevronLeft className="w-5 h-5 text-[#4A465F]" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#4A465F] tracking-tight">Upload Questions</h1>
          <p className="text-[#4A465F]/60 font-medium">Bulk upload questions via CSV</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`bg-white rounded-[2.5rem] p-10 border-2 border-dashed flex flex-col items-center justify-center text-center transition-all min-h-[400px] ${
              dragActive ? 'border-[#5EC2B7] bg-[#5EC2B7]/5' : 'border-[#4A465F]/10'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
              <Upload className={`w-8 h-8 ${dragActive ? 'text-[#5EC2B7]' : 'text-[#4A465F]/40'}`} />
            </div>
            
            {file ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-[#F5F5F5] px-6 py-4 rounded-2xl">
                  <FileText className="w-5 h-5 text-[#5EC2B7]" />
                  <span className="font-bold text-[#4A465F]">{file.name}</span>
                  <button 
                    onClick={() => { setFile(null); setResult(null) }}
                    className="ml-2 text-[#4A465F]/40 hover:text-rose-500"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                {!result && (
                  <button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-8 py-3 bg-[#5EC2B7] text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-[#5EC2B7]/20 flex items-center gap-2 mx-auto disabled:opacity-50"
                  >
                    {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isUploading ? 'Uploading...' : 'Confirm Upload'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xl font-bold text-[#4A465F]">Drag & drop your CSV here</p>
                <p className="text-[#4A465F]/40 font-medium">or</p>
                <label className="inline-block px-6 py-3 bg-[#4A465F] text-white rounded-2xl font-bold cursor-pointer hover:bg-[#4A465F]/90 transition-all">
                  Browse Files
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0])
                        setResult(null)
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[2rem] border border-[#4A465F]/5 shadow-sm space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${result.failed_rows.length === 0 ? 'bg-green-100' : 'bg-amber-100'}`}>
                    {result.failed_rows.length === 0 ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#4A465F]">Upload Complete</h3>
                    <p className="text-[#4A465F]/60 font-medium">
                      Successfully added <span className="text-green-600 font-bold">{result.success_count}</span> questions.
                    </p>
                  </div>
                </div>

                {result.failed_rows.length > 0 && (
                  <div className="bg-rose-50 rounded-2xl p-6 space-y-4">
                    <h4 className="font-bold text-rose-700 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Failed Rows ({result.failed_rows.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {result.failed_rows.map((err, i) => (
                        <p key={i} className="text-sm text-rose-600/80 font-medium bg-white/50 px-3 py-2 rounded-lg border border-rose-100">
                          Row {err.row}: {err.error}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => { setFile(null); setResult(null) }}
                  className="w-full py-3 bg-[#F5F5F5] text-[#4A465F] rounded-xl font-bold hover:bg-[#4A465F]/10 transition-all"
                >
                  Upload Another File
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Guidelines */}
        <div className="space-y-6">
          <div className="bg-[#4A465F] text-white p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#5EC2B7] blur-[60px] opacity-20" />
            <h3 className="text-xl font-bold mb-4">CSV Template</h3>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Download the standard template. Ensure the <b>subject</b> column uses the identifiers listed below.
            </p>
            <button 
              onClick={downloadTemplate}
              className="w-full py-3 bg-[#5EC2B7] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4DB0A6] transition-all shadow-lg shadow-[#5EC2B7]/20"
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
          </div>

          {/* Standardized Subjects */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm">
            <h3 className="font-bold text-[#4A465F] mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#5EC2B7]" />
              Subject Identifiers
            </h3>
            <p className="text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest mb-4">Use these exact values in CSV</p>
            <div className="space-y-2">
              {standardizedSubjects.map(sub => (
                <div key={sub.id} className="flex items-center justify-between p-2 rounded-lg bg-[#F5F5F5] border border-[#4A465F]/5 group hover:border-[#5EC2B7]/30 transition-colors">
                  <span className="text-xs font-bold text-[#4A465F]">{sub.label}</span>
                  <code className="text-[10px] bg-[#2E2E2E] text-white px-2 py-1 rounded font-black group-hover:bg-[#5EC2B7] transition-colors">{sub.id}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-[#4A465F]/5 shadow-sm">
            <h3 className="font-bold text-[#4A465F] mb-4">Requirements</h3>
            <ul className="space-y-3">
              {[
                'Header row is mandatory',
                'Subject is mandatory (use ID)',
                'Options A-D must be filled',
                'Correct option: A, B, C, or D',
                'Difficulty: Easy, Medium, Hard'
              ].map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[#4A465F]/70 font-medium">
                  <CheckCircle className="w-4 h-4 text-[#5EC2B7] shrink-0 mt-0.5" />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
