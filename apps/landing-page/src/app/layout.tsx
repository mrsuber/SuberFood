import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/providers/query-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SuberFood - Farm to Table Excellence',
  description: 'Experience the complete journey from farm to your table. Fresh, traceable, sustainable food from our farms, processing facilities, and restaurants.',
  keywords: 'farm to table, organic food, sustainable farming, fresh produce, restaurants, food delivery',
  authors: [{ name: 'SuberFood' }],
  openGraph: {
    title: 'SuberFood - Farm to Table Excellence',
    description: 'Experience the complete journey from farm to your table.',
    type: 'website',
    locale: 'en_US',
    siteName: 'SuberFood',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SuberFood - Farm to Table Excellence',
    description: 'Experience the complete journey from farm to your table.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        <QueryProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
