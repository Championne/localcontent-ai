import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GeoSpark - AI Content for Local Businesses',
  description: 'Spark your local content. Generate SEO-optimized content for your local business in minutes, not hours.',
  icons: {
    icon: [
      { url: '/favicon-512.png', type: 'image/png' },
    ],
    shortcut: '/favicon-512.png',
    apple: '/favicon-512.png',
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
