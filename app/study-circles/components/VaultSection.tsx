'use client'

import { motion } from 'framer-motion'
import { FileText, Link, File, Download, Search, Upload } from 'lucide-react'
import { Resource } from '../lib/data'

interface VaultSectionProps {
  resources: Resource[];
}

export default function VaultSection({ resources }: VaultSectionProps) {
  return (
    <div className="space-y-8 bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#4A465F]/5">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#4A465F]/10">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none group-focus-within:text-[#6FB7B4] transition-colors">
            <Search className="w-5 h-5 text-[#4A465F]/30" />
          </div>
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#F5F5F5] border-2 border-transparent focus:border-[#6FB7B4] focus:ring-4 focus:ring-[#6FB7B4]/10 transition-all outline-none text-[#4A465F] font-bold"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 4px 12px -2px rgba(94, 194, 183, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 rounded-2xl bg-[#5EC2B7] text-white font-extrabold shadow-lg shadow-[#5EC2B7]/20 transition-all flex items-center justify-center gap-3"
        >
          Upload New Resource
          <Upload className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Resource List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((res, index) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)" }}
            className="group p-6 rounded-3xl bg-[#F5F5F5]/40 border-2 border-transparent hover:border-[#6FB7B4]/10 hover:bg-white transition-all cursor-pointer relative"
          >
            <div className="absolute top-4 right-4 text-[#4A465F]/20 group-hover:text-[#6FB7B4] transition-colors">
              <Download className="w-5 h-5" />
            </div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                {res.type === 'PDF' && <FileText className="w-8 h-8 text-rose-400" />}
                {res.type === 'Link' && <Link className="w-8 h-8 text-[#6FB7B4]" />}
                {res.type === 'Doc' && <File className="w-8 h-8 text-[#4A465F]" />}
              </div>
              
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#4A465F] group-hover:text-[#6FB7B4] transition-colors line-clamp-1">
                  {res.title}
                </h4>
                <div className="flex items-center gap-2 text-xs font-bold text-[#4A465F]/40 uppercase tracking-widest">
                  <span className="px-2 py-0.5 rounded-md bg-[#4A465F]/5">{res.type}</span>
                  <span>•</span>
                  <span>{res.date}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#4A465F]/5 flex items-center gap-2">
                <img 
                  src={`https://i.pravatar.cc/150?u=${res.uploadedBy}`} 
                  alt={res.uploadedBy} 
                  className="w-6 h-6 rounded-lg opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
                />
                <span className="text-sm font-bold text-[#4A465F]/40 truncate">
                  By {res.uploadedBy}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
