import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ReportIssueLink from '@/components/ReportIssueLink'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GeoSpark - AI Content for Local Businesses',
  description: 'Spark your local content. Generate SEO-optimized content for your local business in minutes, not hours.',
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'GeoSpark - AI Content for Local Businesses',
    description: 'Dominate your local market with AI-powered content. Generate hyper-local, SEO-optimized posts in minutes.',
    images: ['/logo-geospark.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        {children}
        <ReportIssueLink />
      </body>
    </html>
  )
}
