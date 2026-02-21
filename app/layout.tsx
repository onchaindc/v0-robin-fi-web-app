import type { Metadata } from 'next'
import { Crimson_Pro, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Web3Providers } from '@/components/providers/web3-providers'

const fontSans = DM_Sans({ subsets: ["latin"], variable: '--font-sans' });
const fontSerif = Crimson_Pro({ subsets: ["latin"], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'RobinFi - Decentralized Vault Management',
  description: 'Manage, create, and explore decentralized vaults with RobinFi',
  generator: 'v0.app',
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
    <html lang="en" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="font-sans antialiased bg-robin-dark text-robin-gray-light">
        <Web3Providers>
          {children}
        </Web3Providers>
        <Analytics />
      </body>
    </html>
  )
}
