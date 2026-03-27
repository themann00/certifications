'use client'

import { useState, useEffect } from 'react'
import AdminLogin from '@/components/admin/AdminLogin'
import AdminDashboard from '@/components/admin/AdminDashboard'

type AuthState = 'checking' | 'unauthenticated' | 'authenticated'

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>('checking')

  useEffect(() => {
    fetch('/api/auth/check')
      .then((res) => {
        setAuthState(res.ok ? 'authenticated' : 'unauthenticated')
      })
      .catch(() => setAuthState('unauthenticated'))
  }, [])

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-mondrian-red animate-pulse" />
          <div className="w-3 h-3 bg-mondrian-blue animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-mondrian-yellow animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (authState === 'unauthenticated') {
    return <AdminLogin onSuccess={() => setAuthState('authenticated')} />
  }

  return <AdminDashboard onLogout={() => setAuthState('unauthenticated')} />
}
