'use client'

import { motion } from 'framer-motion'
import { FileText, Download, Edit2, Trash2, Search, Filter, BookOpen } from 'lucide-react'
import { StudyMaterial } from '../services/api'

interface MaterialTableProps {
  materials: StudyMaterial[]
  isLoading: boolean
  actionLoading: number | null
  onEdit: (material: StudyMaterial) => void
  onDelete: (material: StudyMaterial) => void
  onClearFilters: () => void
}

export default function MaterialTable({
  materials,
  isLoading,
  actionLoading,
  onEdit,
  onDelete,
  onClearFilters
}: MaterialTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-[#5EC2B7]/20 border-t-[#5EC2B7] rounded-full animate-spin" />
        <p className="text-sm font-bold text-[#4A465F]/40 animate-pulse">Fetching materials...</p>
      </div>
    )
  }

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-20 h-20 rounded-[2rem] bg-[#F5F5F5] flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-[#4A465F]/20" />
        </div>
        <h3 className="text-xl font-black text-[#4A465F] mb-2">No materials found</h3>
        <p className="text-sm text-[#4A465F]/40 font-medium max-w-xs mb-8">
          We couldn't find any study materials matching your current filters.
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-3 rounded-2xl bg-[#5EC2B7] text-white font-bold text-sm shadow-lg shadow-[#5EC2B7]/20 hover:scale-105 transition-transform"
        >
          Clear all filters
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F5F5F5]/50">
            <th className="px-8 py-5 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Material Info</th>
            <th className="px-8 py-5 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Subject</th>
            <th className="px-8 py-5 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Stats</th>
            <th className="px-8 py-5 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest">Uploaded</th>
            <th className="px-8 py-5 text-[10px] font-black text-[#4A465F]/40 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#4A465F]/5">
          {materials.map((m) => (
            <motion.tr
              key={m.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group hover:bg-[#F5F5F5]/30 transition-colors"
            >
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#5EC2B7]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-[#5EC2B7]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#4A465F] mb-0.5 line-clamp-1">{m.title}</h4>
                    <p className="text-[11px] text-[#4A465F]/40 font-medium line-clamp-1">{m.description || 'No description'}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-5">
                <span className="px-3 py-1 rounded-full bg-[#4A465F]/5 text-[#4A465F]/60 text-[10px] font-bold uppercase tracking-wider">
                  {m.subject_display}
                </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex items-center gap-2 text-[#4A465F]/60">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-bold">{m.download_count}</span>
                </div>
              </td>
              <td className="px-8 py-5">
                <div className="text-sm font-bold text-[#4A465F]">{m.uploaded_by_name}</div>
                <div className="text-[11px] text-[#4A465F]/40 font-medium">
                  {new Date(m.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(m)}
                    className="p-2.5 rounded-xl bg-white border border-[#4A465F]/10 text-[#4A465F]/40 hover:text-[#5EC2B7] hover:border-[#5EC2B7]/30 transition-all shadow-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(m)}
                    className="p-2.5 rounded-xl bg-white border border-[#4A465F]/10 text-[#4A465F]/40 hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
