'use client'

import { useState } from 'react'
import Sidebar from '../../dashboard/components/Sidebar'
import TopNavbar from '../../dashboard/components/TopNavbar'
import MockTestsAppBackground from './MockTestsAppBackground'

export default function MockTestsShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MockTestsAppBackground />

      <div className="flex">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <TopNavbar />
          {children}
        </div>
      </div>
    </div>
  )
}

