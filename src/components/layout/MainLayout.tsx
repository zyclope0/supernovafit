'use client'

import Sidebar from './Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-space">
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 lg:ml-72">
        <main className="h-full overflow-y-auto">
          <div className="container mx-auto px-4 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 