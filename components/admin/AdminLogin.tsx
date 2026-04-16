'use client'

import { useState } from 'react'

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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f9f7f0' }}>
      <div className="w-full max-w-sm">

        {/* Login card */}
        <div className="bg-white border-2 border-black">
          <div className="border-b-2 border-black px-6 py-4">
            <h1 className="text-sm font-bold uppercase tracking-widest text-black">Admin Access</h1>
            <p className="text-xs text-gray-400 mt-0.5">certifications.jacobmann.me</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">
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
              <p className="text-xs text-mondrian-red font-bold">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Enter Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-center mt-4">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-black uppercase tracking-widest transition-colors"
          >
            ← Back to Certifications
          </a>
        </p>

      </div>
    </div>
  )
}
