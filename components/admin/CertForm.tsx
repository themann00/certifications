'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Upload, X, Loader2, ChevronDown, Plus, FileText, Check } from 'lucide-react'
import type { Certification, Tag } from '@/lib/types'

interface CertFormProps {
  initial?: Certification
  tags: Tag[]
  existingOrgs: string[]
  onSave: (data: Partial<Certification>) => Promise<void>
  onCancel: () => void
}

type ExpType = 'date' | 'none'

// ─── Org Dropdown ─────────────────────────────────────────────────────────────

function OrgDropdown({
  value,
  onChange,
  existingOrgs,
}: {
  value: string
  onChange: (v: string) => void
  existingOrgs: string[]
}) {
  const [open, setOpen] = useState(false)
  const [addingNew, setAddingNew] = useState(false)
  const [newOrg, setNewOrg] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const newOrgInputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setAddingNew(false)
        setNewOrg('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus new org input when it appears
  useEffect(() => {
    if (addingNew) newOrgInputRef.current?.focus()
  }, [addingNew])

  function selectOrg(org: string) {
    onChange(org)
    setOpen(false)
    setAddingNew(false)
    setNewOrg('')
  }

  function confirmNewOrg() {
    const trimmed = newOrg.trim()
    if (!trimmed) return
    selectOrg(trimmed)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setAddingNew(false) }}
        className="admin-input flex items-center justify-between w-full text-left"
      >
        <span className={value ? 'text-black' : 'text-gray-400'}>
          {value || 'Select or add organization…'}
        </span>
        <ChevronDown
          size={14}
          className={`flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 top-full left-0 right-0 border-2 border-t-0 border-mondrian-black bg-white shadow-lg max-h-64 overflow-y-auto">
          {existingOrgs.length === 0 && !addingNew && (
            <div className="px-4 py-3 font-body text-xs text-gray-400 italic">
              No organizations yet — add your first one below.
            </div>
          )}

          {existingOrgs.map((org) => (
            <button
              key={org}
              type="button"
              onClick={() => selectOrg(org)}
              className={`w-full text-left px-4 py-2.5 font-body text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${
                value === org ? 'font-semibold' : ''
              }`}
            >
              {org}
              {value === org && <Check size={12} className="text-mondrian-blue" />}
            </button>
          ))}

          {/* Divider */}
          {existingOrgs.length > 0 && (
            <div className="border-t-2 border-mondrian-black" />
          )}

          {/* Add new */}
          {!addingNew ? (
            <button
              type="button"
              onClick={() => setAddingNew(true)}
              className="w-full text-left px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-widest text-mondrian-blue hover:bg-blue-50 flex items-center gap-2 transition-colors"
            >
              <Plus size={12} /> Add New Organization
            </button>
          ) : (
            <div className="p-3 border-t-2 border-mondrian-black bg-gray-50">
              <input
                ref={newOrgInputRef}
                type="text"
                value={newOrg}
                onChange={(e) => setNewOrg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); confirmNewOrg() }
                  if (e.key === 'Escape') { setAddingNew(false); setNewOrg('') }
                }}
                placeholder="Organization name…"
                className="admin-input mb-2 !py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={confirmNewOrg}
                  disabled={!newOrg.trim()}
                  className="btn-primary !py-1 !px-3 text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  <Check size={11} /> Add
                </button>
                <button
                  type="button"
                  onClick={() => { setAddingNew(false); setNewOrg('') }}
                  className="btn-secondary !py-1 !px-3 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export default function CertForm({ initial, tags, existingOrgs, onSave, onCancel }: CertFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [issuingOrg, setIssuingOrg] = useState(initial?.issuingOrg ?? '')
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? '')
  const [expType, setExpType] = useState<ExpType>(initial?.noExpiration ? 'none' : 'date')
  const [expirationDate, setExpirationDate] = useState(initial?.expirationDate ?? '')
  const [certificationId, setCertificationId] = useState(initial?.certificationId ?? '')
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? '')
  const [linkType, setLinkType] = useState(initial?.linkType ?? 'hidden')
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId ?? '')
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(initial?.fileType ?? null)
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tags ?? [])
  const [featured, setFeatured] = useState(initial?.featured ?? false)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const DRAFT_KEY = 'cert-form-draft'

  function clearFile() {
    setImageUrl('')
    setImagePublicId('')
    setFileType(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleReset() {
    try { sessionStorage.removeItem(DRAFT_KEY) } catch {}
    setName('')
    setIssuingOrg('')
    setIssueDate('')
    setExpType('date')
    setExpirationDate('')
    setCertificationId('')
    setLinkUrl('')
    setLinkType('hidden')
    setSelectedTags([])
    setFeatured(false)
    setError('')
    clearFile()
  }

  // Restore draft on mount (add mode only)
  useEffect(() => {
    if (initial) return
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY)
      if (!saved) return
      const d = JSON.parse(saved)
      if (d.name) setName(d.name)
      if (d.issuingOrg) setIssuingOrg(d.issuingOrg)
      if (d.issueDate) setIssueDate(d.issueDate)
      if (d.expType) setExpType(d.expType)
      if (d.expirationDate) setExpirationDate(d.expirationDate)
      if (d.certificationId) setCertificationId(d.certificationId)
      if (d.linkUrl) setLinkUrl(d.linkUrl)
      if (d.linkType) setLinkType(d.linkType)
      if (d.selectedTags) setSelectedTags(d.selectedTags)
      if (d.featured !== undefined) setFeatured(d.featured)
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-save draft on field changes (add mode only)
  useEffect(() => {
    if (initial) return
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        name, issuingOrg, issueDate, expType, expirationDate,
        certificationId, linkUrl, linkType, selectedTags, featured,
      }))
    } catch {}
  }, [name, issuingOrg, issueDate, expType, expirationDate, certificationId, linkUrl, linkType, selectedTags, featured, initial])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    const detectedType: 'image' | 'pdf' = file.type === 'application/pdf' ? 'pdf' : 'image'
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setImageUrl(data.url)
      setImagePublicId(data.publicId)
      setFileType(detectedType)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function toggleTag(id: string) {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !issuingOrg || !issueDate) {
      setError('Name, issuing organization, and issue date are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        name,
        issuingOrg,
        issueDate,
        expirationDate: expType === 'date' ? expirationDate || null : null,
        noExpiration: expType === 'none',
        certificationId,
        linkUrl: linkUrl || null,
        linkType: linkType as Certification['linkType'],
        imageUrl: imageUrl || null,
        imagePublicId: imagePublicId || null,
        fileType: fileType,
        tags: selectedTags,
        featured,
      })
      try { sessionStorage.removeItem(DRAFT_KEY) } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  const tagColorDots: Record<string, string> = {
    red: 'bg-mondrian-red',
    blue: 'bg-mondrian-blue',
    yellow: 'bg-mondrian-yellow',
    black: 'bg-mondrian-black',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {!initial && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary !py-1 !px-3 font-body text-xs"
          >
            Reset Form
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Certification Name <span className="text-mondrian-red">*</span>
          </label>
          <input
            className="admin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AWS Solutions Architect – Associate"
            required
          />
        </div>

        {/* Issuing org — dropdown */}
        <div>
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Issuing Organization <span className="text-mondrian-red">*</span>
          </label>
          <OrgDropdown
            value={issuingOrg}
            onChange={setIssuingOrg}
            existingOrgs={existingOrgs}
          />
        </div>

        {/* Issue date */}
        <div>
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Issue Date <span className="text-mondrian-red">*</span>
          </label>
          <input
            type="date"
            className="admin-input"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </div>

        {/* Expiration */}
        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Expiration
          </label>
          <div className="flex gap-6 mb-3">
            {(['date', 'none'] as const).map((val) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={val}
                  checked={expType === val}
                  onChange={() => setExpType(val)}
                  className="w-4 h-4 accent-black"
                />
                <span className="font-body text-sm">
                  {val === 'date' ? 'Has expiration date' : 'No expiration'}
                </span>
              </label>
            ))}
          </div>
          {expType === 'date' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="admin-input max-w-xs"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
              <button
                type="button"
                onClick={() => {
                  if (!issueDate) return
                  const d = new Date(issueDate)
                  d.setFullYear(d.getFullYear() + 1)
                  setExpirationDate(d.toISOString().split('T')[0])
                }}
                disabled={!issueDate}
                className="btn-secondary !py-1.5 !px-3 font-body text-xs whitespace-nowrap disabled:opacity-40"
                title="Set to 1 year after issue date"
              >
                +1 Year
              </button>
            </div>
          )}
        </div>

        {/* Cert ID */}
        <div>
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Certification ID
            <span className="ml-2 text-gray-400 normal-case tracking-normal font-normal">
              (backend only)
            </span>
          </label>
          <input
            className="admin-input"
            value={certificationId}
            onChange={(e) => setCertificationId(e.target.value)}
            placeholder="e.g. AWS-123456"
          />
        </div>

        {/* Featured */}
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-black"
            />
            <span className="font-body text-sm font-semibold uppercase tracking-widest">
              Featured
            </span>
          </label>
        </div>

        {/* Link URL */}
        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Link URL
          </label>
          <input
            type="url"
            className="admin-input mb-3"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
          />
          <div className="flex flex-wrap gap-4">
            {(
              [
                { value: 'my_cert', label: 'Link to MY cert' },
                { value: 'description_page', label: 'Link to description page' },
                { value: 'hidden', label: 'Hide from frontend' },
              ] as const
            ).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={opt.value}
                  checked={linkType === opt.value}
                  onChange={() => setLinkType(opt.value)}
                  className="w-4 h-4 accent-black"
                />
                <span className="font-body text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* File upload — image or PDF */}
        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Certificate Image or PDF
          </label>

          <div className="flex gap-4 items-start flex-wrap">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              {uploading ? 'Uploading…' : imageUrl ? 'Replace File' : 'Upload File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Preview */}
            {imageUrl && (
              <div className="relative border-2 border-mondrian-black">
                {fileType === 'pdf' ? (
                  <div className="h-24 w-24 flex flex-col items-center justify-center bg-gray-50 gap-1">
                    <FileText size={28} className="text-mondrian-red" />
                    <span className="font-body text-[10px] uppercase tracking-wider text-gray-500">
                      PDF
                    </span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-24 w-auto object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 bg-mondrian-black text-white w-5 h-5 flex items-center justify-center"
                  aria-label="Remove file"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          {uploadError && (
            <p className="font-body text-xs text-mondrian-red mt-2">{uploadError}</p>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="sm:col-span-2">
            <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-2 border-2 border-mondrian-black px-3 py-1.5 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="w-3.5 h-3.5 accent-black"
                  />
                  <span className={`w-2.5 h-2.5 ${tagColorDots[tag.color] ?? 'bg-black'}`} />
                  <span className="font-body text-xs font-semibold uppercase tracking-wider">
                    {tag.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="font-body text-xs text-mondrian-red font-semibold">{error}</p>
      )}

      <div className="flex gap-3 pt-2 border-t-2 border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : initial ? 'Update Certification' : 'Add Certification'}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!initial) try { sessionStorage.removeItem(DRAFT_KEY) } catch {}
            onCancel()
          }}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
