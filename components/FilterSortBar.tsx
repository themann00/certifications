'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import type { FilterState, Tag, ExpirationStatus, SortBy, SortDir } from '@/lib/types'
import { STATUS_LABELS } from '@/lib/utils'

interface FilterSortBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  tags: Tag[]
  orgs: string[]
}

const TAG_ACCENT: Record<string, string> = {
  red: 'bg-mondrian-red text-white border-mondrian-red',
  blue: 'bg-mondrian-blue text-white border-mondrian-blue',
  yellow: 'bg-mondrian-yellow text-black border-mondrian-yellow',
  black: 'bg-mondrian-black text-white border-mondrian-black',
}
const TAG_INACTIVE: Record<string, string> = {
  red: 'bg-mondrian-white text-mondrian-red border-mondrian-red',
  blue: 'bg-mondrian-white text-mondrian-blue border-mondrian-blue',
  yellow: 'bg-mondrian-white text-black border-black',
  black: 'bg-mondrian-white text-mondrian-black border-mondrian-black',
}

const ALL_STATUSES: ExpirationStatus[] = ['active', 'expires_soon', 'expired', 'no_expiration']

const STATUS_ACTIVE_CLASSES: Record<ExpirationStatus, string> = {
  active: 'bg-mondrian-blue text-white border-mondrian-blue',
  expires_soon: 'bg-mondrian-yellow text-black border-mondrian-yellow',
  expired: 'bg-mondrian-red text-white border-mondrian-red',
  no_expiration: 'bg-mondrian-black text-white border-mondrian-black',
}

export default function FilterSortBar({ filters, onChange, tags, orgs }: FilterSortBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  const activeFilterCount =
    (filters.selectedTags.length > 0 ? 1 : 0) +
    (filters.selectedOrgs.length > 0 ? 1 : 0) +
    (filters.selectedStatuses.length > 0 ? 1 : 0)

  function toggleTag(id: string) {
    const next = filters.selectedTags.includes(id)
      ? filters.selectedTags.filter((t) => t !== id)
      : [...filters.selectedTags, id]
    onChange({ ...filters, selectedTags: next })
  }

  function toggleOrg(org: string) {
    const next = filters.selectedOrgs.includes(org)
      ? filters.selectedOrgs.filter((o) => o !== org)
      : [...filters.selectedOrgs, org]
    onChange({ ...filters, selectedOrgs: next })
  }

  function toggleStatus(s: ExpirationStatus) {
    const next = filters.selectedStatuses.includes(s)
      ? filters.selectedStatuses.filter((x) => x !== s)
      : [...filters.selectedStatuses, s]
    onChange({ ...filters, selectedStatuses: next })
  }

  function clearAll() {
    onChange({
      ...filters,
      selectedTags: [],
      selectedOrgs: [],
      selectedStatuses: [],
    })
  }

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'date', label: 'Date' },
    { value: 'name', label: 'Name' },
    { value: 'org', label: 'Org' },
  ]

  return (
    // No outer border — sits inside bg-black p-[3px] wrapper which provides the border
    <div className="bg-mondrian-white">
      {/* Top row */}
      <div className="flex items-center gap-0 border-b-[3px] border-black">

        {/* Featured toggle */}
        <button
          onClick={() => onChange({ ...filters, separateFeatured: !filters.separateFeatured })}
          className={`flex items-center gap-2 px-4 py-3 border-r-[3px] border-black font-black text-xs uppercase tracking-widest transition-colors ${
            filters.separateFeatured
              ? 'bg-black text-white'
              : 'bg-mondrian-white text-black hover:bg-mondrian-yellow'
          }`}
        >
          <span
            className={`w-2 h-2 border-2 flex-shrink-0 ${
              filters.separateFeatured ? 'bg-mondrian-yellow border-mondrian-yellow' : 'border-black'
            }`}
          />
          <span className="hidden sm:inline">Featured First</span>
        </button>

        {/* Sort buttons */}
        <div className="flex items-center gap-0 border-r-[3px] border-black px-4 py-3 flex-1">
          <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest mr-3 hidden md:block">
            Sort
          </span>
          <div className="flex gap-1">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, sortBy: opt.value })}
                className={`px-3 py-1 font-black text-[10px] uppercase tracking-wider border-2 transition-colors ${
                  filters.sortBy === opt.value
                    ? 'bg-black text-white border-black'
                    : 'bg-mondrian-white text-black border-black hover:bg-mondrian-yellow'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort direction */}
        <button
          onClick={() => onChange({ ...filters, sortDir: filters.sortDir === 'desc' ? 'asc' : 'desc' })}
          className="px-4 py-3 border-r-[3px] border-black font-black text-[10px] hover:bg-mondrian-yellow transition-colors flex items-center gap-1"
          title={filters.sortDir === 'desc' ? 'Newest first' : 'Oldest first'}
        >
          {filters.sortDir === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <span className="hidden sm:inline uppercase tracking-widest">
            {filters.sortDir === 'desc' ? 'Desc' : 'Asc'}
          </span>
        </button>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-3 font-black text-[10px] uppercase tracking-widest transition-colors ${
            showFilters ? 'bg-black text-white' : 'bg-mondrian-white text-black hover:bg-mondrian-yellow'
          }`}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-mondrian-red text-white text-[9px] font-black w-4 h-4 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="p-4 space-y-4 border-t-0">

          {/* Status */}
          <div>
            <div className="font-black text-[9px] uppercase tracking-widest text-gray-400 mb-2">Status</div>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={`font-black text-[10px] px-3 py-1 border-2 uppercase tracking-wider transition-colors ${
                    filters.selectedStatuses.includes(s)
                      ? STATUS_ACTIVE_CLASSES[s]
                      : 'bg-mondrian-white text-black border-black hover:bg-mondrian-yellow'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          {tags.length > 0 && (
            <div>
              <div className="font-black text-[9px] uppercase tracking-widest text-gray-400 mb-2">Skills</div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`font-black text-[10px] px-3 py-1 border-2 uppercase tracking-wider transition-colors ${
                      filters.selectedTags.includes(tag.id) ? TAG_ACCENT[tag.color] : TAG_INACTIVE[tag.color]
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Organizations */}
          {orgs.length > 0 && (
            <div>
              <div className="font-black text-[9px] uppercase tracking-widest text-gray-400 mb-2">Issuing Org</div>
              <div className="flex flex-wrap gap-2">
                {orgs.map((org) => (
                  <button
                    key={org}
                    onClick={() => toggleOrg(org)}
                    className={`font-black text-[10px] px-3 py-1 border-2 border-black uppercase tracking-wider transition-colors ${
                      filters.selectedOrgs.includes(org)
                        ? 'bg-black text-white'
                        : 'bg-mondrian-white text-black hover:bg-mondrian-yellow'
                    }`}
                  >
                    {org}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 font-black text-[10px] text-mondrian-red uppercase tracking-wider hover:underline"
            >
              <X size={11} /> Clear All
            </button>
          )}
        </div>
      )}
    </div>
  )
}
