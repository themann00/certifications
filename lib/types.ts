export interface Certification {
  id: string
  name: string
  issuingOrg: string
  issueDate: string // YYYY-MM-DD
  expirationDate: string | null // YYYY-MM-DD or null
  noExpiration: boolean
  certificationId: string // stored only, never sent to frontend
  linkUrl: string | null
  linkType: 'my_cert' | 'description_page' | 'hidden'
  imageUrl: string | null
  imagePublicId: string | null // Cloudinary public_id, stored only
  tags: string[] // tag ids
  featured: boolean
  createdAt: string
  updatedAt: string
}

// What the frontend receives — sensitive fields stripped
export type PublicCertification = Omit<Certification, 'certificationId' | 'imagePublicId'>

export interface Tag {
  id: string
  name: string
  color: 'red' | 'blue' | 'yellow' | 'black'
}

export interface Settings {
  showStats: boolean
}

export type ExpirationStatus = 'active' | 'expires_soon' | 'expired' | 'no_expiration'

export type SortBy = 'date' | 'name' | 'org'
export type SortDir = 'asc' | 'desc'

export interface FilterState {
  separateFeatured: boolean
  selectedTags: string[]
  selectedOrgs: string[]
  selectedStatuses: ExpirationStatus[]
  sortBy: SortBy
  sortDir: SortDir
}
