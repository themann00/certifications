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
    <div className="min-h-screen bg-mondrian-white flex items-center justify-center p-4">
      {/* Mondrian accent blocks — matches jacobmann.me decorative corner pattern */}
      <div className="fixed top-0 left-0 w-[6px] h-full bg-mondrian-black pointer-events-none" />
      <div className="fixed top-0 left-[6px] w-14 h-36 bg-mondrian-red pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[6px] h-full bg-mondrian-black pointer-events-none" />
      <div className="fixed bottom-0 right-[6px] w-24 h-24 bg-mondrian-blue pointer-events-none" />
      <div className="fixed top-0 right-20 w-20 h-[6px] bg-mondrian-black pointer-events-none" />
      <div className="fixed top-[6px] right-20 w-20 h-10 bg-mondrian-yellow pointer-events-none" />

      <div className="w-full max-w-sm">
        <div className="border-[6px] border-mondrian-black">
          {/* Header */}
          <div className="bg-mondrian-black px-6 py-5 flex items-center gap-3">
            <Lock size={18} className="text-mondrian-yellow" />
            <div>
              <h1 className="font-display text-white font-bold text-lg leading-tight">
                Admin Access
              </h1>
              <p className="font-body text-gray-400 text-xs mt-0.5">
                certifications.jacobmann.me
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2">
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
              <p className="font-body text-xs text-mondrian-red font-semibold">{error}</p>
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

        <p className="text-center mt-6">
          <a
            href="/"
            className="font-body text-xs text-gray-400 hover:text-mondrian-black uppercase tracking-widest transition-colors"
          >
            ← Back to Certifications
          </a>
        </p>
      </div>
    </div>
  )
}
