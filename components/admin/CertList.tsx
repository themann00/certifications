'use client'

import { useState, useMemo, useEffect } from 'react'
import { Plus, Pencil, Trash2, Star, Loader2 } from 'lucide-react'
import type { Certification, Tag } from '@/lib/types'
import { formatDate, getExpirationStatus, STATUS_LABELS, STATUS_CLASSES, getCloudinaryThumbnailUrl } from '@/lib/utils'
import CertForm from './CertForm'

interface CertListProps {
  certifications: Certification[]
  tags: Tag[]
  onRefresh: () => void
  onFetchFull: (id: string) => Promise<Certification | null>
  resetKey?: number
}

export default function CertList({ certifications, tags, onRefresh, onFetchFull, resetKey }: CertListProps) {
  const existingOrgs = useMemo(
    () => [...new Set(certifications.map((c) => c.issuingOrg).filter(Boolean))].sort(),
    [certifications]
  )
  const [formMode, setFormMode] = useState<'none' | 'add' | 'edit'>('none')
  const [editingCert, setEditingCert] = useState<Certification | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  // Close form when parent signals a reset (e.g. tab re-clicked)
  useEffect(() => {
    if (resetKey === undefined || resetKey === 0) return
    setFormMode('none')
    setEditingCert(null)
  }, [resetKey])

  async function handleSave(data: Partial<Certification>) {
    const isEdit = formMode === 'edit' && editingCert

    const res = await fetch(
      isEdit ? `/api/certifications/${editingCert.id}` : '/api/certifications',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error ?? `Save failed (${res.status})`)
    }
    setFormMode('none')
    setEditingCert(null)
    onRefresh()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/certifications/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setConfirmDeleteId(null)
      onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  async function startEdit(cert: Certification) {
    // Fetch full cert (includes certificationId) from admin endpoint
    const full = await onFetchFull(cert.id)
    setEditingCert(full ?? cert)
    setFormMode('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const TAG_COLOR: Record<string, string> = {
    red: 'bg-mondrian-red',
    blue: 'bg-mondrian-blue',
    yellow: 'bg-mondrian-yellow',
    black: 'bg-mondrian-black',
  }

  return (
    <div>
      {/* Add/Edit form panel */}
      {formMode !== 'none' && (
        <div className="border-4 border-mondrian-blue mb-6">
          <div className="bg-mondrian-blue px-6 py-3">
            <h3 className="font-display text-white font-bold">
              {formMode === 'add' ? 'Add New Certification' : 'Edit Certification'}
            </h3>
          </div>
          <CertForm
            initial={formMode === 'edit' ? (editingCert ?? undefined) : undefined}
            tags={tags}
            existingOrgs={existingOrgs}
            onSave={handleSave}
            onCancel={() => {
              setFormMode('none')
              setEditingCert(null)
            }}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl">
          Certifications
          <span className="ml-2 font-body text-sm font-normal text-gray-400">
            ({certifications.length})
          </span>
        </h2>
        {formMode === 'none' && (
          <button
            onClick={() => setFormMode('add')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={14} /> Add New
          </button>
        )}
      </div>

      {/* List */}
      {certifications.length === 0 ? (
        <div className="border-4 border-dashed border-gray-200 p-12 text-center">
          <p className="font-body text-sm text-gray-400 uppercase tracking-widest">
            No certifications yet. Add your first one above.
          </p>
        </div>
      ) : (
        <div className="border-4 border-mondrian-black divide-y-2 divide-mondrian-black">
          {certifications.map((cert) => {
            const status = getExpirationStatus(cert)
            const certTags = tags.filter((t) => cert.tags.includes(t.id))

            return (
              <div key={cert.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
                {/* Image thumbnail */}
                <div className="flex-shrink-0 w-16 h-12 border-2 border-mondrian-black bg-gray-100 overflow-hidden">
                  {cert.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getCloudinaryThumbnailUrl(cert.imageUrl, 64, 48) ?? cert.imageUrl}
                      alt={cert.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-300 text-[8px] uppercase tracking-wider">
                        No img
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {cert.featured && (
                      <Star
                        size={12}
                        className="text-mondrian-yellow fill-mondrian-yellow flex-shrink-0"
                      />
                    )}
                    <span className="font-display font-bold text-sm truncate">
                      {cert.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="font-body text-xs text-gray-500">{cert.issuingOrg}</span>
                    <span className="text-gray-300">·</span>
                    <span className="font-body text-xs text-gray-400">{formatDate(cert.issueDate)}</span>
                    <span
                      className={`font-body text-[10px] font-semibold px-1.5 py-px border ${STATUS_CLASSES[status]}`}
                    >
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  {certTags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {certTags.map((t) => (
                        <span
                          key={t.id}
                          className={`w-2 h-2 ${TAG_COLOR[t.color] ?? 'bg-black'}`}
                          title={t.name}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEdit(cert)}
                    className="btn-secondary !py-1.5 !px-3 flex items-center gap-1"
                    title="Edit"
                  >
                    <Pencil size={12} />
                    <span className="hidden sm:inline text-[11px]">Edit</span>
                  </button>

                  {confirmDeleteId === cert.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(cert.id)}
                        disabled={deletingId === cert.id}
                        className="btn-danger !py-1.5 !px-3 flex items-center gap-1 disabled:opacity-50"
                      >
                        {deletingId === cert.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <span className="text-[11px]">Confirm</span>
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="btn-secondary !py-1.5 !px-2 text-[11px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(cert.id)}
                      className="btn-danger !py-1.5 !px-3 flex items-center gap-1"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                      <span className="hidden sm:inline text-[11px]">Delete</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
