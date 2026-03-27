'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import type { Settings } from '@/lib/types'

interface SettingsPanelProps {
  settings: Settings
  onRefresh: () => void
}

export default function SettingsPanel({ settings, onRefresh }: SettingsPanelProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function toggle(key: keyof Settings, value: boolean) {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      })
      if (!res.ok) throw new Error('Failed')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">Settings</h2>
        {saved && (
          <span className="flex items-center gap-1 font-body text-xs text-green-600 font-semibold">
            <Check size={13} /> Saved
          </span>
        )}
      </div>

      <div className="border-4 border-mondrian-black">
        {/* Stats toggle */}
        <div className="flex items-center justify-between p-5 border-b-2 border-mondrian-black last:border-b-0">
          <div>
            <p className="font-body font-semibold text-sm">Show Stats Bar</p>
            <p className="font-body text-xs text-gray-500 mt-0.5">
              Display total certifications, active count, and unique issuers at the top of the
              public page.
            </p>
          </div>
          <button
            onClick={() => toggle('showStats', !settings.showStats)}
            disabled={saving}
            className={`relative w-12 h-6 transition-colors border-2 border-mondrian-black flex-shrink-0 ml-6 disabled:opacity-50 ${
              settings.showStats ? 'bg-mondrian-black' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white border border-black transition-all ${
                settings.showStats ? 'left-6' : 'left-0.5'
              }`}
            />
            {saving && (
              <Loader2
                size={10}
                className="absolute inset-0 m-auto animate-spin text-gray-400"
              />
            )}
          </button>
        </div>
      </div>

      <p className="font-body text-xs text-gray-400 mt-4">
        More settings can be added here as the site grows.
      </p>
    </div>
  )
}
