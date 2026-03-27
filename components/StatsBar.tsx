import type { PublicCertification } from '@/lib/types'
import { getExpirationStatus } from '@/lib/utils'

interface StatsBarProps {
  certifications: PublicCertification[]
}

export default function StatsBar({ certifications }: StatsBarProps) {
  const total = certifications.length
  const active = certifications.filter(
    (c) => getExpirationStatus(c) === 'active' || getExpirationStatus(c) === 'no_expiration'
  ).length
  const issuers = new Set(certifications.map((c) => c.issuingOrg)).size

  const stats = [
    { label: 'Certifications', value: total, accent: 'bg-mondrian-red' },
    { label: 'Active', value: active, accent: 'bg-mondrian-blue' },
    { label: 'Issuing Bodies', value: issuers, accent: 'bg-mondrian-yellow' },
  ]

  return (
    <div className="grid grid-cols-3 gap-0 border-4 border-mondrian-black mb-8">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`relative bg-white/90 backdrop-blur-sm p-6 text-center ${
            i < stats.length - 1 ? 'border-r-4 border-mondrian-black' : ''
          }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accent}`}
          />
          <div className="font-display text-5xl font-bold text-mondrian-black mt-1">
            {stat.value}
          </div>
          <div className="font-body text-xs font-semibold tracking-widest uppercase text-gray-500 mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  )
}
