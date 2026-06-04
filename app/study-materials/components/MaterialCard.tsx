'use client'

import { motion } from 'framer-motion'
import { FileText, Download, Star, ExternalLink, Calendar, Users } from 'lucide-react'
import { StudyMaterial } from '../services/api'
import { useState } from 'react'

interface MaterialCardProps {
  material: StudyMaterial
  onDownload: (id: number) => void
  onToggleFavorite: (id: number) => void
}

export default function MaterialCard({ material, onDownload, onToggleFavorite }: MaterialCardProps) {
  const [isFavorite, setIsFavorite] = useState(material.is_favorite)
  const [downloads, setDownloads] = useState(material.downloads)

  const handleFavoriteClick = async () => {
    setIsFavorite(!isFavorite)
    onToggleFavorite(material.id)
  }

  const handleDownloadClick = () => {
    setDownloads(downloads + 1)
    onDownload(material.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-[2rem] p-6 border border-[#4A465F]/5 shadow-sm hover:shadow-xl hover:shadow-[#4A465F]/5 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-14 h-14 rounded-2xl bg-[#5EC2B7]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <FileText className="w-7 h-7 text-[#5EC2B7]" />
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`p-3 rounded-xl transition-all ${
            isFavorite 
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
              : 'bg-[#F5F5F5] text-[#4A465F]/30 hover:text-amber-500 hover:bg-amber-50'
          }`}
        >
          <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-black text-[#4A465F] line-clamp-1 group-hover:text-[#5EC2B7] transition-colors">
          {material.title}
        </h3>
        <p className="text-sm text-[#4A465F]/60 font-medium line-clamp-2 min-h-[40px]">
          {material.description || 'No description available for this resource.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <span className="px-3 py-1 rounded-full bg-[#4A465F]/5 text-[#4A465F]/60 text-[10px] font-black uppercase tracking-widest">
          {material.subject_display}
        </span>
        {material.tags && material.tags.split(',').map(tag => (
          <span key={tag} className="px-3 py-1 rounded-full bg-[#5EC2B7]/5 text-[#5EC2B7] text-[10px] font-black uppercase tracking-widest">
            {tag.trim()}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#4A465F]/5">
        <div className="flex items-center gap-2 text-[#4A465F]/40">
          <Download className="w-4 h-4" />
          <span className="text-xs font-bold">{downloads} 📥</span>
        </div>
        <div className="flex items-center gap-2 text-[#4A465F]/40 justify-end">
          <Calendar className="w-4 h-4" />
          <span className="text-xs font-bold">{new Date(material.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <button
        onClick={handleDownloadClick}
        className="w-full mt-6 py-4 rounded-2xl bg-[#F5F5F5] text-[#4A465F] font-black text-sm hover:bg-[#5EC2B7] hover:text-white transition-all flex items-center justify-center gap-2 group/btn shadow-sm"
      >
        <Download className="w-4 h-4 group-hover/btn:animate-bounce" />
        Download Resource
      </button>
    </motion.div>
  )
}
