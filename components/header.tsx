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
    <header className="relative z-40 border-b border-border bg-background md:sticky md:top-0">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <Wordmark className="text-lg sm:text-xl" />
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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:size-9"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>

          {isConnected ? (
            <WalletChip />
          ) : (
            <WalletButton label="Connect" className="px-3.5 py-2 text-[13px] sm:px-4" />
          )}
        </div>
      </div>
    </header>
  )
}
