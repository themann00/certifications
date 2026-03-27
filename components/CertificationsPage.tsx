'use client'

import { useState, useMemo } from 'react'
import type { PublicCertification, Tag, Settings, FilterState } from '@/lib/types'
import { filterCertifications, sortCertifications } from '@/lib/utils'
import MondrianBackground from './MondrianBackground'
import StatsBar from './StatsBar'
import FilterSortBar from './FilterSortBar'
import CertCard from './CertCard'
import CertModal from './CertModal'
import { Award } from 'lucide-react'

interface CertificationsPageProps {
  certifications: PublicCertification[]
  tags: Tag[]
  settings: Settings
}

const FEATURED_ACCENTS = [
  'bg-mondrian-red',
  'bg-mondrian-blue',
  'bg-mondrian-yellow',
]

const DEFAULT_FILTERS: FilterState = {
  separateFeatured: true,
  selectedTags: [],
  selectedOrgs: [],
  selectedStatuses: [],
  sortBy: 'date',
  sortDir: 'desc',
}

export default function CertificationsPage({
  certifications,
  tags,
  settings,
}: CertificationsPageProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [modalCert, setModalCert] = useState<PublicCertification | null>(null)

  const orgs = useMemo(
    () => [...new Set(certifications.map((c) => c.issuingOrg))].sort(),
    [certifications]
  )

  const filtered = useMemo(
    () => filterCertifications(certifications, filters),
    [certifications, filters]
  )

  const { featured, rest } = useMemo(() => {
    const sorted = sortCertifications(filtered, filters.sortBy, filters.sortDir)
    if (filters.separateFeatured) {
      return {
        featured: sorted.filter((c) => c.featured),
        rest: sorted.filter((c) => !c.featured),
      }
    }
    return { featured: [], rest: sorted }
  }, [filtered, filters])

  return (
    <>
      <MondrianBackground />

      <div className="relative z-10 min-h-screen bg-white/85 backdrop-blur-sm">
        {/* Header */}
        <header className="border-b-4 border-mondrian-black bg-mondrian-white/95 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a
                href="https://jacobmann.me"
                className="font-display font-bold text-xl tracking-tight text-mondrian-black hover:text-mondrian-blue transition-colors"
              >
                JACOB MANN
              </a>
              <span className="w-px h-5 bg-mondrian-black" />
              <span className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                Certifications
              </span>
            </div>
            <a
              href="/admin"
              className="font-body text-[10px] font-semibold uppercase tracking-widest text-gray-300 hover:text-gray-500 transition-colors"
            >
              admin
            </a>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          {/* Stats */}
          {settings.showStats && certifications.length > 0 && (
            <StatsBar certifications={certifications} />
          )}

          {/* Hero title */}
          <div className="mb-8">
            <h1 className="font-display text-5xl sm:text-7xl font-black text-mondrian-black leading-none tracking-tight">
              CREDENTIALS
            </h1>
            <div className="h-1.5 bg-mondrian-red w-24 mt-3" />
          </div>

          {/* Filter / Sort bar */}
          <FilterSortBar
            filters={filters}
            onChange={setFilters}
            tags={tags}
            orgs={orgs}
          />

          {certifications.length === 0 ? (
            <div className="border-4 border-mondrian-black bg-white/90 backdrop-blur-sm p-16 text-center">
              <Award size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="font-display text-2xl font-bold text-gray-300">
                No certifications yet
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="border-4 border-mondrian-black bg-white/90 backdrop-blur-sm p-16 text-center">
              <p className="font-body text-sm text-gray-400 uppercase tracking-widest">
                No certifications match the current filters.
              </p>
            </div>
          ) : (
            <>
              {/* Featured section */}
              {filters.separateFeatured && featured.length > 0 && (
                <section className="mb-12">
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="font-display text-3xl font-bold text-mondrian-black">
                      Featured
                    </h2>
                    <div className="flex gap-1">
                      <div className="h-1 w-6 bg-mondrian-red" />
                      <div className="h-1 w-6 bg-mondrian-blue" />
                      <div className="h-1 w-6 bg-mondrian-yellow" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {featured.map((cert, i) => (
                      <CertCard
                        key={cert.id}
                        cert={cert}
                        tags={tags}
                        onClick={() => setModalCert(cert)}
                        accentColor={FEATURED_ACCENTS[i % FEATURED_ACCENTS.length]}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* All / remaining (when separateFeatured is false, rest = all certs) */}
              {rest.length > 0 && (
                <section>
                  {filters.separateFeatured && featured.length > 0 && (
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="font-display text-3xl font-bold text-mondrian-black">
                        All Certifications
                      </h2>
                      <div className="flex-1 h-0.5 bg-mondrian-black opacity-10" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {rest.map((cert) => (
                      <CertCard
                        key={cert.id}
                        cert={cert}
                        tags={tags}
                        onClick={() => setModalCert(cert)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t-4 border-mondrian-black mt-16 bg-mondrian-white/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between">
            <span className="font-body text-xs text-gray-400 uppercase tracking-widest">
              © {new Date().getFullYear()} Jacob Mann
            </span>
            <a
              href="https://jacobmann.me"
              className="font-body text-xs font-semibold uppercase tracking-widest text-mondrian-black hover:text-mondrian-blue transition-colors"
            >
              jacobmann.me
            </a>
          </div>
        </footer>
      </div>

      {/* Modal */}
      {modalCert && (
        <CertModal cert={modalCert} onClose={() => setModalCert(null)} />
      )}
    </>
  )
}
