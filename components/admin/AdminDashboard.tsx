'use client'

import { useState, useEffect, useCallback } from 'react'
import { LogOut, RefreshCw } from 'lucide-react'
import type { Certification, PublicCertification, Tag, Settings } from '@/lib/types'
import CertList from './CertList'
import SettingsPanel from './SettingsPanel'
import SkillsModal from './SkillsModal'
import RelinkImagesPanel from './RelinkImagesPanel'

interface AdminDashboardProps {
  onLogout: () => void
}

type TabId = 'certifications' | 'relink' | 'settings'

const TABS: { id: TabId; label: string }[] = [
  { id: 'certifications', label: 'Certifications' },
  { id: 'relink', label: 'Relink Images' },
  { id: 'settings', label: 'Settings' },
]

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('certifications')
  const [certResetKey, setCertResetKey] = useState(0)
  const [skillsModalOpen, setSkillsModalOpen] = useState(false)
  const [certifications, setCertifications] = useState<PublicCertification[]>([])
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

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f9f7f0' }}>

      {/* Header — clean, no Mondrian branding */}
      <header className="bg-white border-b-2 border-black sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
          <span className="text-xs font-bold uppercase tracking-widest text-black">
            Admin — certifications.jacobmann.me
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAll}
              className="text-gray-400 hover:text-black transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <a
              href="/"
              target="_blank"
              className="text-xs text-gray-400 hover:text-black uppercase tracking-widest transition-colors hidden sm:inline"
            >
              View Site
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === activeTab && tab.id === 'certifications') {
                  setCertResetKey((k) => k + 1)
                }
                setActiveTab(tab.id)
              }}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 -mb-[2px] transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              {tab.label}
              {tab.id === 'certifications' && certifications.length > 0 && (
                <span className="ml-1.5 text-gray-400 font-normal">({certifications.length})</span>
              )}
            </button>
          ))}

          <button
            onClick={() => setSkillsModalOpen(true)}
            className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent -mb-[2px] text-gray-400 hover:text-black transition-colors"
          >
            Skills
            {tags.length > 0 && (
              <span className="ml-1.5 text-gray-400 font-normal">({tags.length})</span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <RefreshCw size={20} className="animate-spin mx-auto text-gray-300" />
            <p className="text-xs text-gray-400 mt-3 uppercase tracking-widest">Loading…</p>
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
            {activeTab === 'relink' && (
              <RelinkImagesPanel certifications={certifications} onRefresh={fetchAll} />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel settings={settings} onRefresh={fetchAll} />
            )}
          </>
        )}
      </main>

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
