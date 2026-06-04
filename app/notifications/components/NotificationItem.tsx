'use client'

import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Trophy, Users, Clock, Trash2, CheckCircle, ShieldAlert, Settings } from 'lucide-react'
import { AppNotification } from '../lib/data'
import { format } from 'date-fns'

interface NotificationItemProps {
  notification: AppNotification;
  onRead?: (id: string | number, db_id?: number) => void;
  onDelete?: (id: string | number, db_id?: number) => void;
  compact?: boolean;
}

export default function NotificationItem({ 
  notification, 
  onRead, 
  onDelete, 
  compact = false 
}: NotificationItemProps) {

  const icons = {
    study: <BookOpen className="w-6 h-6 text-[#6FB7B4]" />,
    mock: <CheckCircle2 className="w-6 h-6 text-[#5EC2B7]" />,
    circle: <Users className="w-6 h-6 text-[#4A465F]" />,
    admin: <ShieldAlert className="w-6 h-6 text-rose-500" />,
    system: <Settings className="w-6 h-6 text-[#A8DAD6]" />,
  };

  const formattedTime = notification.created_at
    ? format(new Date(notification.created_at), 'hh:mm a')
    : 'Invalid date';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
      className={`relative group flex items-start gap-5 p-6 rounded-[2rem] border transition-all duration-300 ${
        notification.is_read 
          ? 'bg-transparent border-[#4A465F]/5 grayscale-[0.2]' 
          : 'bg-[#6FB7B4]/5 border-[#6FB7B4]/10 shadow-sm'
      } ${compact ? 'p-4 rounded-3xl' : ''}`}
    >
      <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-all ${
        notification.is_read ? 'bg-[#F5F5F5]' : 'bg-white shadow-md shadow-[#6FB7B4]/5'
      } ${compact ? 'w-10 h-10 rounded-xl p-2' : ''}`}>
        {icons[notification.type]}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h4 className={`font-black text-lg tracking-tight leading-none ${
              notification.is_read ? 'text-[#4A465F]/60' : 'text-[#4A465F]'
            } ${compact ? 'text-base' : ''}`}>
              {notification.title}
            </h4>
            {!compact && (
              <p className="text-[#2E2E2E]/50 text-base font-bold leading-relaxed line-clamp-2">
                {notification.message}
              </p>
            )}
          </div>
          
          <div className="text-xs font-black text-[#4A465F]/30 uppercase tracking-widest whitespace-nowrap">
            {formattedTime}
          </div>
        </div>

        {compact && (
          <p className="text-[#2E2E2E]/40 text-sm font-bold truncate">
            {notification.message}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {!compact && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          {!notification.is_read && (
            <button 
              onClick={() => onRead?.(notification.id, notification.db_id)}
              className="p-3 rounded-xl bg-white text-[#5EC2B7] shadow-lg shadow-[#5EC2B7]/10 hover:bg-[#5EC2B7] hover:text-white transition-all transform hover:scale-110"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => onDelete?.(notification.id, notification.db_id)}
            className="p-3 rounded-xl bg-white text-rose-500 shadow-lg shadow-rose-200 hover:bg-rose-500 hover:text-white transition-all transform hover:scale-110"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </motion.div>
  )
}
