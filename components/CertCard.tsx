'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ExternalLink, FileText } from 'lucide-react'
import type { PublicCertification, Tag } from '@/lib/types'
import {
  getExpirationStatus,
  formatDate,
  getCloudinaryThumbnailUrl,
  STATUS_LABELS,
  STATUS_CLASSES,
} from '@/lib/utils'

interface CertCardProps {
  cert: PublicCertification
  tags: Tag[]
  onClick: () => void
  accentColor?: string
}

const TAG_COLOR_CLASSES: Record<string, string> = {
  red: 'bg-mondrian-red text-white',
  blue: 'bg-mondrian-blue text-white',
  yellow: 'bg-mondrian-yellow text-black',
  black: 'bg-mondrian-black text-white',
}

export default function CertCard({ cert, tags, onClick, accentColor }: CertCardProps) {
  const [pdfThumbError, setPdfThumbError] = useState(false)
  const status = getExpirationStatus(cert)
  const certTags = tags.filter((t) => cert.tags.includes(t.id))
  const isPdf = cert.fileType === 'pdf'
  const thumbnailUrl = cert.imageUrl ? getCloudinaryThumbnailUrl(cert.imageUrl, 400, 280, isPdf) : null
  const accent = accentColor ?? 'bg-mondrian-black'
  const accentText = accent === 'bg-mondrian-yellow' ? 'text-black' : 'text-white'

  return (
    // No outer border — the bg-black p-[3px] grid in CertificationsPage provides it
    // group enables the sliding color bar + image zoom on hover
    <div className="group bg-mondrian-white flex flex-col h-full">

      {/* Accent bar — top color strip */}
      <div className={`h-1.5 ${accent} flex-shrink-0`} />

      {/* Thumbnail — image area with sliding color bar on hover */}
      <button
        onClick={onClick}
        className="block overflow-hidden border-b-[3px] border-black bg-gray-100 relative w-full flex-shrink-0"
        style={{ height: 180 }}
        aria-label={`View ${cert.name} certificate image`}
      >
        {isPdf && thumbnailUrl && !pdfThumbError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={cert.name}
            onError={() => setPdfThumbError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : isPdf ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
            <FileText size={36} className="text-mondrian-red" />
            <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">PDF</span>
          </div>
        ) : thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={cert.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 font-black text-xs tracking-widest uppercase">No Image</span>
          </div>
        )}

        {/* Sliding color bar — portfolio card pattern from jacobmann.me */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${accent} translate-y-full group-hover:translate-y-0 transition-transform duration-300 py-2 px-3 flex items-center justify-center`}
        >
          <span className={`font-black text-[10px] uppercase tracking-widest ${accentText}`}>
            View Certificate
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-black text-sm leading-tight text-black uppercase tracking-tight">
            {cert.name}
          </h3>
          <p className="font-black text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">
            {cert.issuingOrg}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-black text-xs text-gray-400">
            {formatDate(cert.issueDate)}
          </span>
          <span
            className={`font-black text-[10px] px-2 py-0.5 border-2 ${STATUS_CLASSES[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 min-h-[20px]">
          {certTags.map((tag) => (
            <span
              key={tag.id}
              className={`font-black text-[9px] px-1.5 py-0.5 uppercase tracking-wider ${
                TAG_COLOR_CLASSES[tag.color] ?? TAG_COLOR_CLASSES.black
              }`}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="flex-1" />

        {cert.linkUrl && cert.linkType !== 'hidden' && (
          <a
            href={cert.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 font-black text-[10px] uppercase tracking-wider text-black hover:text-mondrian-blue transition-colors self-end"
          >
            {cert.linkType === 'my_cert' ? 'My Credential' : 'Learn More'}
            <ExternalLink size={10} />
          </a>
        )}
      </div>
    </div>
  )
}
