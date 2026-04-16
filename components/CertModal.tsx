'use client'

import { useEffect } from 'react'
import { X, FileText } from 'lucide-react'
import type { PublicCertification } from '@/lib/types'
import { formatDate, getCloudinaryThumbnailUrl } from '@/lib/utils'

interface CertModalProps {
  cert: PublicCertification
  onClose: () => void
}

export default function CertModal({ cert, onClose }: CertModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      {/* bg-black p-[3px] = Mondrian border technique on the modal */}
      <div
        className="bg-black p-[3px] max-w-3xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-mondrian-white">

          {/* Header bar */}
          <div className="flex items-center justify-between border-b-[3px] border-black px-6 py-4 bg-black">
            <span className="font-black text-white text-sm uppercase tracking-tight truncate pr-4">
              {cert.name}
            </span>
            <button
              onClick={onClose}
              className="text-white hover:text-mondrian-yellow transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          {/* Image or PDF */}
          {cert.fileType === 'pdf' && cert.imageUrl ? (
            <div className="border-b-[3px] border-black flex flex-col">
              <img
                src={getCloudinaryThumbnailUrl(cert.imageUrl, 900, 1200, true)}
                alt={`${cert.name} — page 1 preview`}
                className="w-full object-contain"
              />
              <div className="border-t-[3px] border-black px-4 py-2 flex justify-between items-center bg-gray-100">
                <span className="flex items-center gap-1.5 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                  <FileText size={12} /> PDF
                </span>
                <a
                  href={cert.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-black text-[10px] uppercase tracking-widest text-black hover:text-mondrian-blue transition-colors"
                >
                  Open full PDF →
                </a>
              </div>
            </div>
          ) : cert.imageUrl ? (
            <div className="border-b-[3px] border-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cert.imageUrl}
                alt={`${cert.name} certificate`}
                className="w-full object-contain max-h-[60vh]"
              />
            </div>
          ) : (
            <div className="border-b-[3px] border-black bg-gray-100 flex items-center justify-center h-64">
              <span className="text-gray-400 font-black text-xs tracking-widest uppercase">No Image</span>
            </div>
          )}

          {/* Details */}
          <div className="p-6 space-y-2">
            <p className="font-black text-xs text-gray-500 uppercase tracking-widest">
              {cert.issuingOrg}
            </p>
            <p className="font-black text-xs text-gray-400">
              Issued {formatDate(cert.issueDate)}
              {cert.noExpiration
                ? ' · No Expiration'
                : cert.expirationDate
                  ? ` · Expires ${formatDate(cert.expirationDate)}`
                  : ''}
            </p>

            {cert.linkUrl && cert.linkType !== 'hidden' && (
              <a
                href={cert.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 border-2 border-black px-4 py-2 font-black text-xs uppercase tracking-widest hover:bg-mondrian-blue hover:border-mondrian-blue hover:text-white transition-colors duration-200"
              >
                {cert.linkType === 'my_cert' ? 'View My Credential →' : 'Learn More →'}
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
