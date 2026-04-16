'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'

interface AdminLoginProps {
  onSuccess: () => void
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        setError('Incorrect password.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Solid black page with Mondrian grid login panel
    <div className="min-h-screen bg-black flex items-center justify-center p-4">

      <div className="w-full max-w-sm">
        {/* bg-black p-[3px] grid — Mondrian border technique from jacobmann.me */}
        <div className="bg-black p-[3px] grid grid-cols-2 gap-0">

          {/* Lock icon — red accent block */}
          <div className="bg-mondrian-red flex items-center justify-center py-8">
            <Lock size={28} className="text-white" />
          </div>

          {/* Title block */}
          <div className="bg-mondrian-white flex flex-col items-start justify-center px-5 py-6">
            <h1 className="font-black text-black text-lg leading-tight uppercase tracking-tight">
              Admin Access
            </h1>
            <p className="font-black text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
              certifications.jacobmann.me
            </p>
          </div>

          {/* Form — full width */}
          <div className="col-span-2 bg-mondrian-white px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-black text-[10px] uppercase tracking-widest mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-input"
                  placeholder="Enter admin password"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <p className="font-black text-[10px] text-mondrian-red uppercase tracking-wider">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying…' : 'Enter Dashboard'}
              </button>
            </form>
          </div>

          {/* Back link — full width black bar */}
          <div className="col-span-2 bg-black flex items-center justify-center py-3">
            <a
              href="/"
              className="font-black text-[10px] text-mondrian-white/30 hover:text-mondrian-yellow uppercase tracking-widest transition-colors"
            >
              ← Back to Certifications
            </a>
          </div>

        </div>
      </div>

    </div>
  )
}
