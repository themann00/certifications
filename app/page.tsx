import { getCertifications, getTags, getSettings } from '@/lib/storage'
import type { PublicCertification } from '@/lib/types'
import CertificationsPage from '@/components/CertificationsPage'

export const revalidate = 0 // always fresh

export default async function Home() {
  const [certs, tags, settings] = await Promise.all([
    getCertifications(),
    getTags(),
    getSettings(),
  ])

  // Strip backend-only fields before sending to client
  const publicCerts: PublicCertification[] = certs.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ certificationId, imagePublicId, ...rest }) => rest
  )

  return (
    <CertificationsPage
      certifications={publicCerts}
      tags={tags}
      settings={settings}
    />
  )
}
