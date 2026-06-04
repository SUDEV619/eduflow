
'use client'

import { motion } from 'framer-motion'
import { Shield, UserX, UserCheck, Trash2, Loader2, Users } from 'lucide-react'
import { User } from '../services/api'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  actionLoading: number | null
  searchTerm: string
  filterStatus: string
  onToggleStatus: (user: User) => void
  onDelete: (user: User) => void
  onClearFilters: () => void
}

export default function UserTable({
  users,
  isLoading,
  actionLoading,
  searchTerm,
  filterStatus,
  onToggleStatus,
  onDelete,
  onClearFilters,
}: UserTableProps) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (!isLoading && users.length === 0) {
    return (
      <div className="px-8 py-20 text-center border-t border-[#4A465F]/5">
        <div className="flex flex-col items-center gap-4 text-[#4A465F]/30">
          <Users className="w-12 h-12 opacity-30" />
          <p className="text-sm font-bold">No users found</p>
          {(searchTerm || filterStatus !== 'all') && (
            <button
              onClick={onClearFilters}
              className="text-xs text-[#5EC2B7] font-bold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#F5F5F5]/50 border-b border-[#4A465F]/5">
            <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-[0.2em]">User</th>
            <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-[0.2em]">Role</th>
            <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-[0.2em]">Status</th>
            <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-[0.2em]">Joined</th>
            <th className="px-8 py-6 text-[10px] font-black text-[#4A465F]/30 uppercase tracking-[0.2em] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#4A465F]/5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F5]" />
                    <div className="space-y-2">
                      <div className="h-3 w-32 bg-[#F5F5F5] rounded-full" />
                      <div className="h-2 w-44 bg-[#F5F5F5] rounded-full" />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6"><div className="h-3 w-12 bg-[#F5F5F5] rounded-full" /></td>
                <td className="px-8 py-6"><div className="h-6 w-20 bg-[#F5F5F5] rounded-full" /></td>
                <td className="px-8 py-6"><div className="h-3 w-24 bg-[#F5F5F5] rounded-full" /></td>
                <td className="px-8 py-6"><div className="h-8 w-24 bg-[#F5F5F5] rounded-xl ml-auto" /></td>
              </tr>
            ))
          ) : (
            users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`group transition-colors ${
                  !user.is_active ? 'bg-rose-50/30 hover:bg-rose-50/50' : 'hover:bg-[#F5F5F5]/30'
                }`}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform ${
                      user.is_active
                        ? 'bg-gradient-to-br from-[#6FB7B4] to-[#5EC2B7] shadow-[#5EC2B7]/20'
                        : 'bg-gradient-to-br from-gray-300 to-gray-400 shadow-gray-200'
                    }`}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#4A465F] tracking-tight">{user.name}</p>
                      <p className="text-xs font-bold text-[#4A465F]/40">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-3.5 h-3.5 ${user.role === 'ADMIN' ? 'text-amber-500' : 'text-[#4A465F]/20'}`} />
                    <span className={`text-xs font-black tracking-wider uppercase ${
                      user.role === 'ADMIN' ? 'text-amber-600' : 'text-[#4A465F]/40'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    user.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-rose-500'}`} />
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm font-bold text-[#4A465F]/50">
                  {formatDate(user.date_joined)}
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      disabled={actionLoading === user.id}
                      onClick={() => onToggleStatus(user)}
                      title={user.is_active ? 'Deactivate user' : 'Activate user'}
                      className={`p-2.5 rounded-xl transition-all disabled:opacity-40 ${
                        user.is_active
                          ? 'bg-[#F5F5F5] text-[#4A465F]/40 hover:text-amber-500 hover:bg-amber-50'
                          : 'bg-[#F5F5F5] text-[#4A465F]/40 hover:text-green-500 hover:bg-green-50'
                      }`}
                    >
                      {actionLoading === user.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : user.is_active
                        ? <UserX className="w-4 h-4" />
                        : <UserCheck className="w-4 h-4" />
                      }
                    </button>
                    {user.role !== 'ADMIN' && (
                      <button
                        disabled={actionLoading === user.id}
                        onClick={() => onDelete(user)}
                        title="Delete user"
                        className="p-2.5 rounded-xl bg-[#F5F5F5] text-[#4A465F]/40 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
