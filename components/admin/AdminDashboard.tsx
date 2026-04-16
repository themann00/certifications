'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogOut, RefreshCw } from 'lucide-react'
import type { Certification, Tag, Settings } from '@/lib/types'
import CertList from './CertList'
import SettingsPanel from './SettingsPanel'
import SkillsModal from './SkillsModal'

interface AdminDashboardProps {
  onLogout: () => void
}

type TabId = 'certifications' | 'settings'

const TABS: { id: TabId; label: string }[] = [
  { id: 'certifications', label: 'Certifications' },
  { id: 'settings', label: 'Settings' },
]

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('certifications')
  const [certResetKey, setCertResetKey] = useState(0)
  const [skillsModalOpen, setSkillsModalOpen] = useState(false)
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [settings, setSettings] = useState<Settings>({ showStats: true })
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [certsRes, tagsRes, settingsRes] = await Promise.all([
        fetch('/api/certifications'),
        fetch('/api/tags'),
        fetch('/api/settings'),
      ])

      if (certsRes.ok) setCertifications(await certsRes.json())
      if (tagsRes.ok) setTags(await tagsRes.json())
      if (settingsRes.ok) setSettings(await settingsRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchFullCert = useCallback(async (id: string): Promise<Certification | null> => {
    try {
      const res = await fetch(`/api/certifications/${id}`)
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header — vertical border separator pattern from jacobmann.me */}
      <header className="bg-mondrian-black border-b-[6px] border-mondrian-black sticky top-0 z-20">
        <div className="flex items-stretch">
          {/* Brand */}
          <div className="flex items-center gap-3 px-5 py-3 border-r-[6px] border-gray-700">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 bg-mondrian-red" />
              <div className="w-2.5 h-2.5 bg-mondrian-blue" />
              <div className="w-2.5 h-2.5 bg-mondrian-yellow" />
            </div>
            <span className="font-display text-white font-bold text-sm">
              Admin
            </span>
            <span className="font-body text-gray-500 text-xs hidden sm:inline">
              certifications.jacobmann.me
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Refresh */}
          <button
            onClick={fetchAll}
            className="flex items-center px-4 border-l-[6px] border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={15} />
          </button>

          {/* View site */}
          <a
            href="/"
            target="_blank"
            className="hidden sm:flex items-center px-5 border-l-[6px] border-gray-700 font-body text-xs text-gray-400 hover:text-white hover:bg-gray-800 uppercase tracking-widest transition-colors"
          >
            View Site
          </a>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-5 border-l-[6px] border-gray-700 font-body text-xs text-gray-400 hover:text-mondrian-red hover:bg-gray-800 transition-colors uppercase tracking-widest"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-black border-b-[3px] border-mondrian-white/10">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === activeTab && tab.id === 'certifications') {
                  setCertResetKey((k) => k + 1)
                }
                setActiveTab(tab.id)
              }}
              className={`px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b-[3px] -mb-[3px] border-r-[3px] border-r-mondrian-white/10 transition-colors ${
                activeTab === tab.id
                  ? 'border-b-mondrian-yellow text-mondrian-yellow'
                  : 'border-b-transparent text-mondrian-white/40 hover:text-white hover:bg-mondrian-white/5'
              }`}
            >
              {tab.label}
              {tab.id === 'certifications' && certifications.length > 0 && (
                <span className="ml-2 bg-mondrian-white/10 text-mondrian-white/40 text-[9px] px-1.5 py-px font-black">
                  {certifications.length}
                </span>
              )}
            </button>
          ))}

          {/* Skills — opens modal */}
          <button
            onClick={() => setSkillsModalOpen(true)}
            className="px-6 py-3 font-black text-[10px] uppercase tracking-widest border-b-[3px] border-b-transparent border-r-[3px] border-r-mondrian-white/10 -mb-[3px] text-mondrian-white/40 hover:text-white hover:bg-mondrian-white/5 transition-colors"
          >
            Skills
            {tags.length > 0 && (
              <span className="ml-2 bg-mondrian-white/10 text-mondrian-white/40 text-[9px] px-1.5 py-px font-black">
                {tags.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 text-mondrian-white">
        {loading ? (
          <div className="text-center py-20">
            <RefreshCw size={24} className="animate-spin mx-auto text-gray-300" />
            <p className="font-body text-xs text-gray-400 mt-3 uppercase tracking-widest">
              Loading…
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'certifications' && (
              <CertList
                certifications={certifications}
                tags={tags}
                onRefresh={fetchAll}
                onFetchFull={fetchFullCert}
                resetKey={certResetKey}
                onOpenSkillsModal={() => setSkillsModalOpen(true)}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel settings={settings} onRefresh={fetchAll} />
            )}
          </>
        )}
      </main>

      {/* Skills modal */}
      {skillsModalOpen && (
        <SkillsModal
          tags={tags}
          onRefresh={fetchAll}
          onClose={() => setSkillsModalOpen(false)}
        />
      )}
    </div>
  )
}
