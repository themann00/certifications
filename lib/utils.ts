import type { PublicCertification, ExpirationStatus, FilterState, SortBy, SortDir } from './types'

export function getExpirationStatus(cert: PublicCertification): ExpirationStatus {
  if (cert.noExpiration) return 'no_expiration'
  if (!cert.expirationDate) return 'active'

  const now = new Date()
  const expDate = new Date(cert.expirationDate)
  const daysUntil = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) return 'expired'
  if (daysUntil <= 90) return 'expires_soon'
  return 'active'
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function getCloudinaryThumbnailUrl(url: string, width = 400, height = 280): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  const isPdf = url.toLowerCase().endsWith('.pdf')
  if (isPdf) {
    // Generate a JPEG thumbnail of page 1 for PDFs
    return url
      .replace('/upload/', `/upload/pg_1,c_fill,w_${width},h_${height}/`)
      .replace(/\.pdf$/i, '.jpg')
  }
  return url.replace('/upload/', `/upload/c_fill,w_${width},h_${height}/`)
}

export function filterCertifications(
  certs: PublicCertification[],
  filters: FilterState
): PublicCertification[] {
  return certs.filter((cert) => {
    if (filters.selectedTags.length > 0) {
      const hasTag = filters.selectedTags.some((tagId) => cert.tags.includes(tagId))
      if (!hasTag) return false
    }
    if (filters.selectedOrgs.length > 0) {
      if (!filters.selectedOrgs.includes(cert.issuingOrg)) return false
    }
    if (filters.selectedStatuses.length > 0) {
      const status = getExpirationStatus(cert)
      if (!filters.selectedStatuses.includes(status)) return false
    }
    return true
  })
}

export function sortCertifications(
  certs: PublicCertification[],
  sortBy: SortBy,
  sortDir: SortDir
): PublicCertification[] {
  const sorted = [...certs].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'date') {
      cmp = new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    } else if (sortBy === 'name') {
      cmp = a.name.localeCompare(b.name)
    } else if (sortBy === 'org') {
      cmp = a.issuingOrg.localeCompare(b.issuingOrg)
    }
    return sortDir === 'asc' ? -cmp : cmp
  })
  return sorted
}

export const STATUS_LABELS: Record<ExpirationStatus, string> = {
  active: 'Active',
  expires_soon: 'Expires Soon',
  expired: 'Expired',
  no_expiration: 'No Expiration',
}

export const STATUS_CLASSES: Record<ExpirationStatus, string> = {
  active: 'bg-mondrian-blue text-white border-mondrian-blue',
  expires_soon: 'bg-mondrian-yellow text-black border-mondrian-yellow',
  expired: 'bg-white text-gray-400 border-gray-400',
  no_expiration: 'bg-white text-black border-black',
}
