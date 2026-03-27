'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import type { Certification, Tag } from '@/lib/types'

interface CertFormProps {
  initial?: Certification
  tags: Tag[]
  onSave: (data: Partial<Certification>) => Promise<void>
  onCancel: () => void
}

type ExpType = 'date' | 'none'

export default function CertForm({ initial, tags, onSave, onCancel }: CertFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [issuingOrg, setIssuingOrg] = useState(initial?.issuingOrg ?? '')
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? '')
  const [expType, setExpType] = useState<ExpType>(
    initial?.noExpiration ? 'none' : 'date'
  )
  const [expirationDate, setExpirationDate] = useState(initial?.expirationDate ?? '')
  const [certificationId, setCertificationId] = useState(initial?.certificationId ?? '')
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? '')
  const [linkType, setLinkType] = useState(
    initial?.linkType ?? 'hidden'
  )
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '')
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initial?.tags ?? [])
  const [featured, setFeatured] = useState(initial?.featured ?? false)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setImageUrl(data.url)
      setImagePublicId(data.publicId)
    } catch {
      setUploadError('Image upload failed. Check Cloudinary config.')
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
        tags: selectedTags,
        featured,
      })
    } catch {
      setError('Failed to save. Please try again.')
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

        {/* Issuing org */}
        <div>
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Issuing Organization <span className="text-mondrian-red">*</span>
          </label>
          <input
            className="admin-input"
            value={issuingOrg}
            onChange={(e) => setIssuingOrg(e.target.value)}
            placeholder="e.g. Amazon Web Services"
            required
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
            <input
              type="date"
              className="admin-input max-w-xs"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              placeholder="Expiration date"
            />
          )}
        </div>

        {/* Cert ID (backend only) */}
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

        {/* Image upload */}
        <div className="sm:col-span-2">
          <label className="block font-body text-xs font-semibold uppercase tracking-widest mb-1.5">
            Certificate Image
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
              {uploading ? 'Uploading…' : imageUrl ? 'Replace Image' : 'Upload Image'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {imageUrl && (
              <div className="relative border-2 border-mondrian-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-24 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('')
                    setImagePublicId('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="absolute -top-2 -right-2 bg-mondrian-black text-white w-5 h-5 flex items-center justify-center"
                  aria-label="Remove image"
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
                  <span
                    className={`w-2.5 h-2.5 ${tagColorDots[tag.color] ?? 'bg-black'}`}
                  />
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

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t-2 border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : initial ? 'Update Certification' : 'Add Certification'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
