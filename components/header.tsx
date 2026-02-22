'use client'

import { useState, useEffect } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useTheme } from '@/components/providers/theme-provider'
import { Sun, Moon, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMounted, setIsMounted] = useState(false)
  const [theme, setTheme] = useState('dark')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setTheme(localStorage.getItem('theme') || 'dark')
  }, [])

  let themeContext: { theme: string; toggleTheme: () => void } | null = null
  try {
    themeContext = { theme, toggleTheme: () => {
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      setTheme(newTheme)
      localStorage.setItem('theme', newTheme)
      if (newTheme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.add('dark')
      }
    }}
  } catch (e) {
    // Fallback if context not available
  }

  return (
    <>
      <header className="sticky top-0 z-50 glass-card-dark border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-robin-pink flex items-center justify-center">
              <span className="font-serif font-bold text-primary-foreground">R</span>
            </div>
            <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-primary to-robin-pink bg-clip-text text-transparent">RobinFi</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => themeContext?.toggleTheme()}
              className="rounded-lg"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="rounded-lg"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>

            <ConnectButton />
          </div>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-card-dark w-full max-w-md mx-4 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Appearance</h3>
                <div className="flex gap-2">
                  <Button
                    variant={theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (theme !== 'light') themeContext?.toggleTheme()
                    }}
                    className="flex-1"
                  >
                    Light
                  </Button>
                  <Button
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (theme !== 'dark') themeContext?.toggleTheme()
                    }}
                    className="flex-1"
                  >
                    Dark
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Network</h3>
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-sm">Robinhood Chain Testnet</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowSettings(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
