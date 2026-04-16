'use client'

import { useState } from 'react'
import { RefreshCw, Link, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import type { Certification, PublicCertification } from '@/lib/types'
import type { CloudinaryAsset } from '@/app/api/admin/cloudinary-assets/route'
import { getCloudinaryThumbnailUrl } from '@/lib/utils'

interface RelinkImagesPanelProps {
  certifications: PublicCertification[]
  onRefresh: () => void
}

type Status = 'idle' | 'loading' | 'done' | 'error'

interface MatchState {
  [certId: string]: string // certId -> cloudinary publicId
}

export default function RelinkImagesPanel({ certifications, onRefresh }: RelinkImagesPanelProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [assets, setAssets] = useState<CloudinaryAsset[]>([])
  const [fullCerts, setFullCerts] = useState<Certification[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [matches, setMatches] = useState<MatchState>({})
  const [saving, setSaving] = useState<string | null>(null) // certId being saved
  const [saved, setSaved] = useState<Set<string>>(new Set())

  const certsWithoutImage = certifications.filter((c) => !c.imageUrl)

  async function fetchAssets() {
    setStatus('loading')
    setErrorMsg('')
    try {
      const [assetsRes, certsRes] = await Promise.all([
        fetch('/api/admin/cloudinary-assets'),
        fetch('/api/admin/certifications'),
      ])
      if (!assetsRes.ok) {
        const body = await assetsRes.json().catch(() => ({}))
        throw new Error(body.error ?? `Cloudinary fetch failed (${assetsRes.status})`)
      }
      const data: CloudinaryAsset[] = await assetsRes.json()
      const fullData: Certification[] = certsRes.ok ? await certsRes.json() : []
      setAssets(data)
      setFullCerts(fullData)

      // Auto-match: if cert has imagePublicId stored, find the matching Cloudinary asset
      const autoMatches: MatchState = {}
      for (const cert of fullData.filter((c) => !c.imageUrl && c.imagePublicId)) {
        const match = data.find((a) => a.publicId === cert.imagePublicId)
        if (match) autoMatches[cert.id] = match.publicId
      }
      setMatches(autoMatches)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  async function applyRelink(cert: PublicCertification) {
    const publicId = matches[cert.id]
    if (!publicId) return
    const asset = assets.find((a) => a.publicId === publicId)
    if (!asset) return

    setSaving(cert.id)
    try {
      const fileType = asset.format === 'pdf' || asset.resourceType === 'raw' ? 'pdf' : 'image'
      const res = await fetch('/api/admin/relink-image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certId: cert.id,
          imageUrl: asset.secureUrl,
          imagePublicId: asset.publicId,
          fileType,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved((prev) => new Set(prev).add(cert.id))
      onRefresh()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(null)
    }
  }

  async function applyAll() {
    for (const cert of certsWithoutImage) {
      if (matches[cert.id] && !saved.has(cert.id)) {
        await applyRelink(cert)
      }
    }
  }

  if (certsWithoutImage.length === 0) {
    return (
      <div className="bg-white border-2 border-black p-5 flex items-center gap-3">
        <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
        <p className="text-sm text-gray-600">All certifications have images linked.</p>
      </div>
    )
  }

  const matchCount = certsWithoutImage.filter((c) => matches[c.id]).length
  const unlinkedAssets = assets.filter(
    (a) => !fullCerts.some((c) => c.imagePublicId === a.publicId || c.imageUrl === a.secureUrl)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-sm uppercase tracking-widest">Relink Images</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {certsWithoutImage.length} cert{certsWithoutImage.length !== 1 ? 's' : ''} missing image URL
          </p>
        </div>
        {status === 'idle' || status === 'error' ? (
          <button
            onClick={fetchAssets}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw size={13} />
            Fetch from Cloudinary
          </button>
        ) : status === 'loading' ? (
          <button disabled className="btn-primary flex items-center gap-2 opacity-50">
            <RefreshCw size={13} className="animate-spin" />
            Fetching…
          </button>
        ) : (
          <button
            onClick={fetchAssets}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        )}
      </div>

      {errorMsg && (
        <p className="text-xs text-red-600 font-semibold mb-4">{errorMsg}</p>
      )}

      {status === 'done' && (
        <>
          {/* Summary */}
          <div className="bg-white border-2 border-black p-4 mb-4 flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold">{assets.length}</span>
              <span className="text-gray-500"> assets in Cloudinary · </span>
              <span className="font-semibold">{matchCount}</span>
              <span className="text-gray-500"> auto-matched</span>
            </div>
            {matchCount > 0 && (
              <button
                onClick={applyAll}
                disabled={saving !== null}
                className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Link size={11} /> Apply All Matches
              </button>
            )}
          </div>

          {/* Certs needing images */}
          <div className="flex flex-col gap-3 mb-6">
            {certsWithoutImage.map((cert) => {
              const selectedPublicId = matches[cert.id]
              const selectedAsset = assets.find((a) => a.publicId === selectedPublicId)
              const isSaved = saved.has(cert.id)
              const isSaving = saving === cert.id
              const fullCert = fullCerts.find((c) => c.id === cert.id)
              const wasAutoMatched = fullCert?.imagePublicId && selectedPublicId === fullCert.imagePublicId

              return (
                <div key={cert.id} className="bg-white border-2 border-black p-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-sm">{cert.name}</p>
                      <p className="text-xs text-gray-500">{cert.issuingOrg}</p>
                      {wasAutoMatched && (
                        <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wide">
                          Auto-matched by public ID
                        </span>
                      )}
                      {fullCert?.imagePublicId && !wasAutoMatched && (
                        <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">
                          Has public ID but not in Cloudinary
                        </span>
                      )}
                    </div>
                    {isSaved && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-semibold flex-shrink-0">
                        <CheckCircle size={13} /> Linked
                      </span>
                    )}
                  </div>

                  {!isSaved && (
                    <div className="flex items-end gap-3">
                      {/* Asset selector */}
                      <div className="flex-1 relative">
                        <select
                          value={selectedPublicId ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            setMatches((prev) => {
                              const next = { ...prev }
                              if (val) next[cert.id] = val
                              else delete next[cert.id]
                              return next
                            })
                          }}
                          className="admin-input pr-8 appearance-none text-xs w-full"
                        >
                          <option value="">— Select Cloudinary asset —</option>
                          {assets.map((a) => (
                            <option key={a.publicId} value={a.publicId}>
                              {a.publicId.replace('jacobmann-me-certifications/', '')} ({a.format.toUpperCase()}, {(a.bytes / 1024).toFixed(0)}KB)
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                      </div>

                      {/* Preview */}
                      {selectedAsset && (
                        <div className="flex-shrink-0 w-14 h-10 border border-gray-200 bg-gray-100 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              selectedAsset.resourceType === 'raw'
                                ? getCloudinaryThumbnailUrl(selectedAsset.secureUrl, 56, 40, true) ?? selectedAsset.secureUrl
                                : getCloudinaryThumbnailUrl(selectedAsset.secureUrl, 56, 40) ?? selectedAsset.secureUrl
                            }
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Apply button */}
                      <button
                        onClick={() => applyRelink(cert)}
                        disabled={!selectedPublicId || isSaving}
                        className="btn-primary !py-1.5 !px-3 flex items-center gap-1.5 text-xs flex-shrink-0 disabled:opacity-40"
                      >
                        {isSaving ? (
                          <RefreshCw size={11} className="animate-spin" />
                        ) : (
                          <Link size={11} />
                        )}
                        Link
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Unlinked Cloudinary assets info */}
          {unlinkedAssets.length > 0 && (
            <div className="border-2 border-dashed border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                {unlinkedAssets.length} Cloudinary asset{unlinkedAssets.length !== 1 ? 's' : ''} not linked to any cert
              </p>
              <div className="flex flex-wrap gap-2">
                {unlinkedAssets.map((a) => (
                  <span key={a.publicId} className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-1 font-mono">
                    {a.publicId.replace('jacobmann-me-certifications/', '')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {assets.length === 0 && (
            <div className="bg-white border-2 border-black p-5 flex items-center gap-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
              <p className="text-sm text-gray-600">No assets found in Cloudinary folder <code className="text-xs bg-gray-100 px-1">jacobmann-me-certifications/</code></p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
