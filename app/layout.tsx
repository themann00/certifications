import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jacob Mann — Certifications',
  description:
    'Professional certifications, licenses, and credentials earned by Jacob Mann.',
  openGraph: {
    title: 'Jacob Mann — Certifications',
    description: 'Professional certifications, licenses, and credentials.',
    url: 'https://certifications.jacobmann.me',
    siteName: 'Jacob Mann Certifications',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
