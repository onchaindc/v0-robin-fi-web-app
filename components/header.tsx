'use client'

import Link from 'next/link'
import { useTheme } from '@/components/providers/theme-provider'
import { Wordmark } from '@/components/logo'
import { WalletButton, WalletChip } from '@/components/connect-wallet'
import { useAccount } from 'wagmi'
import { EXPLORER_URL } from '@/lib/chain'
import { Moon, Sun } from 'lucide-react'

export function Header({ showNav = false }: { showNav?: boolean }) {
  const { theme, toggleTheme } = useTheme()
  const { isConnected } = useAccount()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <Wordmark />
        </Link>

        {showNav && (
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a className="transition-colors hover:text-foreground" href="#strategy">
              Strategy
            </a>
            <a className="transition-colors hover:text-foreground" href="#how">
              How it works
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href={EXPLORER_URL}
              target="_blank"
              rel="noreferrer"
            >
              Explorer
            </a>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {isConnected ? <WalletChip /> : <WalletButton label="Connect" className="px-4 py-2" />}
        </div>
      </div>
    </header>
  )
}
