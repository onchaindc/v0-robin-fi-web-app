'use client'

import { useEffect, useState } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('dark')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setTheme(savedTheme)
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
  }

  if (!isMounted) return <>{children}</>

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

import { createContext, useContext } from 'react'

const ThemeContext = createContext<{ theme: string; toggleTheme: () => void } | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
