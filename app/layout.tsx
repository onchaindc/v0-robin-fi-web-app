import type { Metadata, Viewport } from 'next'
import { Crimson_Pro, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Web3Providers } from '@/components/providers/web3-providers'

const fontSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
const fontSerif = Crimson_Pro({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'RobinFi — Tokenized equity indexes, owned on-chain',
  description:
    'Create and invest in tokenized-stock index vaults. One deposit, instant diversification, composable ERC-4626 shares on Robinhood Chain.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#070a09',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${fontSans.variable} ${fontSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <Web3Providers>{children}</Web3Providers>
        <Analytics />
      </body>
    </html>
  )
}
