'use client'

import { useState } from 'react'
import AdminSidebar from './components/AdminSidebar'
import AdminTopNavbar from './components/AdminTopNavbar'
import AdminRoute from './components/AdminRoute'
import AdminDashboardBackground from './components/AdminDashboardBackground'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <AdminRoute>
      <div className="min-h-screen relative">
        <AdminDashboardBackground />
        
        <AdminSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <AdminTopNavbar />
          
          <main className="flex-1 p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  )
}
