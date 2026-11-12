'use client'

import { Compass, LayoutGrid, Plus, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  showManageTab?: boolean
  children: React.ReactNode
}

const TABS = [
  { value: 'my-vaults', label: 'My vaults', icon: LayoutGrid },
  { value: 'explore', label: 'Explore', icon: Compass },
  { value: 'create', label: 'Create', icon: Plus },
]

export function TabNavigation({
  activeTab,
  onTabChange,
  showManageTab = false,
  children,
}: TabNavigationProps) {
  const tabs = showManageTab
    ? [...TABS, { value: 'manage', label: 'Manage', icon: SlidersHorizontal }]
    : TABS

  return (
    <div className="w-full">
      <div className="sticky top-16 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {children}
    </div>
  )
}
