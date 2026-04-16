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
  // For PDFs: use Cloudinary's page-1 JPEG transformation as the thumbnail
  const thumbnailUrl = cert.imageUrl ? getCloudinaryThumbnailUrl(cert.imageUrl, 400, 280, isPdf) : null
  const accent = accentColor ?? 'bg-mondrian-black'

  const accentText = accent === 'bg-mondrian-yellow' ? 'text-mondrian-black' : 'text-white'

  return (
    <div className="cert-card group border-4 border-mondrian-black bg-mondrian-white flex flex-col">
      {/* Accent bar */}
      <div className={`h-1.5 ${accent}`} />

      {/* Thumbnail — clickable, sliding color bar on hover (parent site portfolio pattern) */}
      <button
        onClick={onClick}
        className="block overflow-hidden border-b-4 border-mondrian-black bg-gray-100 relative w-full"
        style={{ height: 180 }}
        aria-label={`View ${cert.name} certificate image`}
      >
        {isPdf && thumbnailUrl && !pdfThumbError ? (
          // Cloudinary renders page 1 of the PDF as a JPEG — use plain img for onError fallback
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={cert.name}
            onError={() => setPdfThumbError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : isPdf ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gray-100">
            <FileText size={36} className="text-mondrian-red" />
            <span className="font-body text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              PDF
            </span>
          </div>
        ) : thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={cert.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <span className="text-gray-300 font-body text-xs tracking-widest uppercase">
              No Image
            </span>
          </div>
        )}

        {/* Sliding color bar — parent site PortfolioCategoryCard pattern */}
        <div
          className={`absolute bottom-0 left-0 right-0 ${accent} translate-y-full group-hover:translate-y-0 transition-transform duration-300 py-2 px-3 flex items-center justify-center`}
        >
          <span className={`font-body text-[10px] font-black uppercase tracking-widest ${accentText}`}>
            View Certificate
          </span>
        </div>
      </button>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <div>
          <h3 className="font-display font-bold text-base leading-tight text-mondrian-black">
            {cert.name}
          </h3>
          <p className="font-body text-xs font-medium text-gray-500 mt-0.5 uppercase tracking-wider">
            {cert.issuingOrg}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-xs text-gray-400">
            {formatDate(cert.issueDate)}
          </span>
          <span
            className={`font-body text-xs font-semibold px-2 py-0.5 border-2 ${STATUS_CLASSES[status]}`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 min-h-[22px]">
          {certTags.map((tag) => (
            <span
              key={tag.id}
              className={`font-body text-[10px] font-semibold px-1.5 py-0.5 uppercase tracking-wider ${
                TAG_COLOR_CLASSES[tag.color] ?? TAG_COLOR_CLASSES.black
              }`}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Link */}
        {cert.linkUrl && cert.linkType !== 'hidden' && (
          <a
            href={cert.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 font-body text-xs font-semibold uppercase tracking-wider text-mondrian-black hover:text-mondrian-blue transition-colors self-end"
          >
            {cert.linkType === 'my_cert' ? 'My Credential' : 'Learn More'}
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  )
}
