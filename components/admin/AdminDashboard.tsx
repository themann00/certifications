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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-mondrian-black border-b-4 border-mondrian-black sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-mondrian-red" />
              <div className="w-3 h-3 bg-mondrian-blue" />
              <div className="w-3 h-3 bg-mondrian-yellow" />
            </div>
            <span className="font-display text-white font-bold text-base">
              Admin Dashboard
            </span>
            <span className="font-body text-gray-500 text-xs hidden sm:inline">
              certifications.jacobmann.me
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="text-gray-400 hover:text-white transition-colors"
              title="Refresh data"
            >
              <RefreshCw size={15} />
            </button>
            <a
              href="/"
              target="_blank"
              className="font-body text-xs text-gray-400 hover:text-white uppercase tracking-widest transition-colors hidden sm:inline"
            >
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 font-body text-xs text-gray-400 hover:text-mondrian-red transition-colors uppercase tracking-widest"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b-4 border-mondrian-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === activeTab && tab.id === 'certifications') {
                  setCertResetKey((k) => k + 1)
                }
                setActiveTab(tab.id)
              }}
              className={`px-6 py-3 font-body text-xs font-semibold uppercase tracking-widest border-b-4 -mb-[4px] transition-colors ${
                activeTab === tab.id
                  ? 'border-mondrian-blue text-mondrian-blue'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              {tab.label}
              {tab.id === 'certifications' && certifications.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] px-1.5 py-px font-bold">
                  {certifications.length}
                </span>
              )}
            </button>
          ))}

          {/* Skills — opens modal */}
          <button
            onClick={() => setSkillsModalOpen(true)}
            className="px-6 py-3 font-body text-xs font-semibold uppercase tracking-widest border-b-4 border-transparent -mb-[4px] text-gray-500 hover:text-black transition-colors"
          >
            Skills
            {tags.length > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-500 text-[10px] px-1.5 py-px font-bold">
                {tags.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
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
