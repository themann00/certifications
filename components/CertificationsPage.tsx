'use client'

import { useState, useMemo } from 'react'
import type { PublicCertification, Tag, Settings, FilterState } from '@/lib/types'
import { filterCertifications, sortCertifications, getExpirationStatus } from '@/lib/utils'
import FilterSortBar from './FilterSortBar'
import CertCard from './CertCard'
import CertModal from './CertModal'

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

// Stat row width options (flex ratios): 25/25/50, 25/50/25, 50/25/25, 33/33/33
const STAT_LAYOUTS = [
  [1, 1, 2],
  [1, 2, 1],
  [2, 1, 1],
  [1, 1, 1],
] as const

export default function CertificationsPage({
  certifications,
  tags,
  settings,
}: CertificationsPageProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [modalCert, setModalCert] = useState<PublicCertification | null>(null)

  // Randomize stat widths on each page load
  const [statLayout] = useState(
    () => STAT_LAYOUTS[Math.floor(Math.random() * STAT_LAYOUTS.length)]
  )

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

  // Stats
  const total = certifications.length
  const active = certifications.filter(
    (c) => getExpirationStatus(c) === 'active' || getExpirationStatus(c) === 'no_expiration'
  ).length
  const issuers = new Set(certifications.map((c) => c.issuingOrg)).size

  return (
    <>
      <div className="min-h-screen bg-black">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="bg-black border-b-[3px] border-mondrian-white/10 sticky top-0 z-20">
          <div className="flex items-stretch">
            <a
              href="https://jacobmann.me"
              className="flex items-center px-5 py-3 border-r-[3px] border-mondrian-white/10 hover:bg-mondrian-yellow transition-colors duration-200 group"
            >
              <span className="font-black text-sm tracking-tight text-mondrian-white uppercase group-hover:text-black">
                Jacob Mann
              </span>
            </a>
            <div className="flex items-center px-5 border-r-[3px] border-mondrian-white/10 flex-1">
              <span className="font-black text-xs uppercase tracking-[0.2em] text-mondrian-white/40">
                Certifications
              </span>
            </div>
            <a
              href="/admin"
              className="flex items-center px-5 font-black text-[10px] uppercase tracking-widest text-mondrian-white/20 hover:text-black hover:bg-mondrian-yellow transition-colors duration-200"
            >
              admin
            </a>
          </div>
        </header>

        {/* ── Hero grid — full width, left to right ──────────────────────
            Row 1: Title (3col) | Black accent box (1col)
            Row 2: All 3 stats in one row, widths randomised each load      */}
        <div className="bg-black p-[3px] grid grid-cols-2 md:grid-cols-4 gap-[3px]">

          {/* Title */}
          <div className="col-span-2 md:col-span-3 bg-mondrian-white flex items-end p-6 md:p-10 min-h-[160px]">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-black leading-none uppercase tracking-tight">
              Credentials
            </h1>
          </div>

          {/* Black accent box — replaces the old Total tile */}
          <div className="col-span-1 bg-black" />

          {/* Stats row — full width, randomised flex ratios */}
          {settings.showStats && total > 0 ? (
            <div className="col-span-2 md:col-span-4 bg-black flex gap-[3px]">
              <div
                className="bg-mondrian-red flex flex-col items-center justify-center py-8 text-center"
                style={{ flex: statLayout[0] }}
              >
                <div className="text-4xl md:text-6xl font-black text-white leading-none">{total}</div>
                <div className="text-white text-[10px] font-black uppercase tracking-widest mt-2">Total</div>
              </div>
              <div
                className="bg-mondrian-blue flex flex-col items-center justify-center py-8 text-center"
                style={{ flex: statLayout[1] }}
              >
                <div className="text-4xl md:text-6xl font-black text-white leading-none">{active}</div>
                <div className="text-white text-[10px] font-black uppercase tracking-widest mt-2">Active</div>
              </div>
              <div
                className="bg-mondrian-yellow flex flex-col items-center justify-center py-8 text-center"
                style={{ flex: statLayout[2] }}
              >
                <div className="text-4xl md:text-6xl font-black text-black leading-none">{issuers}</div>
                <div className="text-black text-[10px] font-black uppercase tracking-widest mt-2">Issuing Bodies</div>
              </div>
            </div>
          ) : (
            /* Decorative colour row when stats are hidden */
            <div className="col-span-2 md:col-span-4 bg-black flex gap-[3px]">
              <div className="bg-mondrian-red h-6" style={{ flex: 2 }} />
              <div className="bg-mondrian-blue h-6" style={{ flex: 1 }} />
              <div className="bg-mondrian-yellow h-6" style={{ flex: 3 }} />
            </div>
          )}

        </div>

        {/* ── Filter / Sort bar — full width ─────────────────────────────── */}
        <div className="bg-black p-[3px] pt-0">
          <FilterSortBar
            filters={filters}
            onChange={setFilters}
            tags={tags}
            orgs={orgs}
          />
        </div>

        {/* ── Below-filter content — constrained to 1200px, Mondrian sides ─
            Absolute side panels fill the wrapper height automatically.
            Center content is max-w-[1200px] centered.
            Side panels appear at viewports ≥ 1400px.                        */}
        <div className="relative bg-black">

          {/* Mondrian side panels — pointer-events-none, decorative only */}
          <div
            className="absolute inset-0 hidden min-[1400px]:flex pointer-events-none"
            aria-hidden="true"
          >
            {/* Left panel */}
            <div className="flex flex-col flex-1 gap-[3px] p-[3px] pr-0 pt-0">
              <div className="bg-mondrian-red"    style={{ flex: '2 0 0' }} />
              <div className="bg-mondrian-blue"   style={{ flex: '1 0 0' }} />
              <div className="bg-mondrian-yellow" style={{ flex: '3 0 0' }} />
              <div className="bg-mondrian-red"    style={{ flex: '1 0 0' }} />
              <div className="bg-mondrian-blue"   style={{ flex: '2 0 0' }} />
              <div className="bg-mondrian-yellow" style={{ flex: '1 0 0' }} />
            </div>

            {/* Spacer — same width as the center content box */}
            <div className="flex-none w-[1200px]" />

            {/* Right panel */}
            <div className="flex flex-col flex-1 gap-[3px] p-[3px] pl-0 pt-0">
              <div className="bg-mondrian-yellow" style={{ flex: '1 0 0' }} />
              <div className="bg-mondrian-red"    style={{ flex: '3 0 0' }} />
              <div className="bg-mondrian-blue"   style={{ flex: '2 0 0' }} />
              <div className="bg-mondrian-yellow" style={{ flex: '1 0 0' }} />
              <div className="bg-mondrian-red"    style={{ flex: '1 0 0' }} />
              <div className="bg-mondrian-blue"   style={{ flex: '2 0 0' }} />
            </div>
          </div>

          {/* Center content — sits above side panels via z-10 */}
          <div className="relative z-10 max-w-[1200px] mx-auto p-[3px] pt-0 flex flex-col gap-[3px]">

            {/* Empty states */}
            {certifications.length === 0 && (
              <div className="bg-mondrian-white p-16 text-center">
                <p className="font-black text-sm uppercase tracking-widest text-gray-400">
                  No certifications yet.
                </p>
              </div>
            )}

            {certifications.length > 0 && filtered.length === 0 && (
              <div className="bg-mondrian-white p-16 text-center">
                <p className="font-black text-sm uppercase tracking-widest text-gray-400">
                  No certifications match the current filters.
                </p>
              </div>
            )}

            {/* Featured section */}
            {filters.separateFeatured && featured.length > 0 && (
              <div className="bg-black grid grid-cols-2 md:grid-cols-4 gap-[3px]">
                {/* Section label — full width row */}
                <div className="col-span-2 md:col-span-4 bg-black flex items-center gap-3 px-5 py-3">
                  <span className="font-black text-xs uppercase tracking-widest text-mondrian-yellow">
                    Featured
                  </span>
                  <div className="flex gap-1 items-center">
                    <div className="h-[3px] w-4 bg-mondrian-red" />
                    <div className="h-[3px] w-4 bg-mondrian-blue" />
                    <div className="h-[3px] w-4 bg-mondrian-yellow" />
                  </div>
                </div>
                {/* Cards */}
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
            )}

            {/* All / remaining certifications */}
            {rest.length > 0 && (
              <div className="bg-black grid grid-cols-2 md:grid-cols-4 gap-[3px]">
                {/* Section label — only when featured section is also showing */}
                {filters.separateFeatured && featured.length > 0 && (
                  <div className="col-span-2 md:col-span-4 bg-black flex items-center px-5 py-3">
                    <span className="font-black text-xs uppercase tracking-widest text-mondrian-white/40">
                      All Certifications
                    </span>
                  </div>
                )}
                {/* Cards */}
                {rest.map((cert) => (
                  <CertCard
                    key={cert.id}
                    cert={cert}
                    tags={tags}
                    onClick={() => setModalCert(cert)}
                  />
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="bg-black border-t-[3px] border-mondrian-white/10 mt-[3px]">
          <div className="flex items-stretch">
            <div className="flex items-center px-5 py-4 border-r-[3px] border-mondrian-white/10 flex-1">
              <span className="font-black text-xs text-mondrian-white/30 uppercase tracking-widest">
                © {new Date().getFullYear()} Jacob Mann
              </span>
            </div>
            <a
              href="https://jacobmann.me"
              className="flex items-center px-5 py-4 font-black text-xs uppercase tracking-widest text-mondrian-white/40 hover:bg-mondrian-yellow hover:text-black transition-colors duration-200"
            >
              jacobmann.me →
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
