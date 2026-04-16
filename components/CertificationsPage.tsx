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

  // Stats for the hero grid
  const total = certifications.length
  const active = certifications.filter(
    (c) => getExpirationStatus(c) === 'active' || getExpirationStatus(c) === 'no_expiration'
  ).length
  const issuers = new Set(certifications.map((c) => c.issuingOrg)).size

  return (
    <>
      {/* Solid black page — Mondrian grid fills left to right, top to bottom */}
      <div className="min-h-screen bg-black">

        {/* ── Header ─────────────────────────────────────────────────────
            Vertical border separator pattern from jacobmann.me SiteNav   */}
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

        {/* ── Hero grid — Title + Stats ───────────────────────────────
            bg-black + p-[3px]: black bleeds through as borders (jacobmann.me pattern) */}
        <div className="bg-black p-[3px] grid grid-cols-2 md:grid-cols-4 gap-0">

          {/* Title block */}
          <div className="col-span-2 md:col-span-3 bg-mondrian-white flex items-end p-6 md:p-10 min-h-[160px]">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-black leading-none uppercase tracking-tight">
              Credentials
            </h1>
          </div>

          {/* Red stat — Total */}
          {settings.showStats && total > 0 ? (
            <div className="bg-mondrian-red flex flex-col items-center justify-center py-8 text-center col-span-1 md:col-span-1 row-span-1">
              <div className="text-4xl md:text-6xl font-black text-white leading-none">{total}</div>
              <div className="text-white text-[10px] font-black uppercase tracking-widest mt-2">Total</div>
            </div>
          ) : (
            <div className="bg-mondrian-red col-span-1 md:col-span-1" />
          )}

          {/* Blue stat — Active */}
          {settings.showStats && total > 0 ? (
            <div className="bg-mondrian-blue flex flex-col items-center justify-center py-8 text-center col-span-1">
              <div className="text-4xl md:text-6xl font-black text-white leading-none">{active}</div>
              <div className="text-white text-[10px] font-black uppercase tracking-widest mt-2">Active</div>
            </div>
          ) : (
            <div className="bg-mondrian-blue col-span-1" />
          )}

          {/* Yellow stat — Issuers, spans 3 cols desktop to fill row */}
          {settings.showStats && total > 0 ? (
            <div className="bg-mondrian-yellow flex flex-col items-center justify-center py-8 text-center col-span-1 md:col-span-3">
              <div className="text-4xl md:text-6xl font-black text-black leading-none">{issuers}</div>
              <div className="text-black text-[10px] font-black uppercase tracking-widest mt-2">Issuing Bodies</div>
            </div>
          ) : (
            <div className="bg-mondrian-yellow col-span-1 md:col-span-3" />
          )}

        </div>

        {/* ── Filter / Sort bar ───────────────────────────────────────── */}
        <div className="bg-black p-[3px] pt-0">
          <FilterSortBar
            filters={filters}
            onChange={setFilters}
            tags={tags}
            orgs={orgs}
          />
        </div>

        {/* ── Empty states ─────────────────────────────────────────────── */}
        {certifications.length === 0 && (
          <div className="bg-black p-[3px] pt-0">
            <div className="bg-mondrian-white p-16 text-center">
              <p className="font-black text-sm uppercase tracking-widest text-gray-400">
                No certifications yet.
              </p>
            </div>
          </div>
        )}

        {certifications.length > 0 && filtered.length === 0 && (
          <div className="bg-black p-[3px] pt-0">
            <div className="bg-mondrian-white p-16 text-center">
              <p className="font-black text-sm uppercase tracking-widest text-gray-400">
                No certifications match the current filters.
              </p>
            </div>
          </div>
        )}

        {/* ── Featured section ─────────────────────────────────────────── */}
        {filters.separateFeatured && featured.length > 0 && (
          <>
            {/* Section label */}
            <div className="bg-black px-[3px]">
              <div className="bg-black flex items-center gap-4 px-5 py-3">
                <span className="font-black text-xs uppercase tracking-widest text-mondrian-yellow">
                  Featured
                </span>
                <div className="flex gap-1">
                  <div className="h-[3px] w-5 bg-mondrian-red" />
                  <div className="h-[3px] w-5 bg-mondrian-blue" />
                  <div className="h-[3px] w-5 bg-mondrian-yellow" />
                </div>
              </div>
            </div>

            {/* Featured cards grid — bg-black p-[3px] = black borders */}
            <div className="bg-black p-[3px] pt-0 grid grid-cols-2 md:grid-cols-4 gap-0">
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
          </>
        )}

        {/* ── All / Remaining certifications ──────────────────────────── */}
        {rest.length > 0 && (
          <>
            {/* Section label — only shown when featured section also exists */}
            {filters.separateFeatured && featured.length > 0 && (
              <div className="bg-black px-[3px]">
                <div className="bg-black flex items-center gap-4 px-5 py-3">
                  <span className="font-black text-xs uppercase tracking-widest text-mondrian-white/50">
                    All Certifications
                  </span>
                </div>
              </div>
            )}

            {/* Cards grid */}
            <div className="bg-black p-[3px] pt-0 grid grid-cols-2 md:grid-cols-4 gap-0">
              {rest.map((cert) => (
                <CertCard
                  key={cert.id}
                  cert={cert}
                  tags={tags}
                  onClick={() => setModalCert(cert)}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Footer ──────────────────────────────────────────────────── */}
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
