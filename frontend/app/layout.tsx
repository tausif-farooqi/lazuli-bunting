import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const siteUrl = 'https://lazulibunting.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Lazuli Bunting',
  description: 'Predict sighting locations for Lazuli Buntings across North America',
  openGraph: {
    title: 'Lazuli Bunting',
    description: 'Predict sighting locations for Lazuli Buntings across North America',
    url: siteUrl,
    siteName: 'Lazuli Bunting',
      images: [
        {
          url: '/images/lazuli-bunting-2.jpg',
          width: 960,
          height: 640,
          alt: 'Lazuli Bunting — a vibrant blue songbird with turquoise-blue plumage and orange-rust breast',
        },
      ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lazuli Bunting',
    description: 'Predict sighting locations for Lazuli Buntings across North America',
    images: ['/images/lazuli-bunting.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
