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
  { value: 'my-vaults', label: 'My vaults', shortLabel: 'Vaults', icon: LayoutGrid },
  { value: 'explore', label: 'Explore', shortLabel: 'Explore', icon: Compass },
  { value: 'create', label: 'Create', shortLabel: 'Create', icon: Plus },
]

export function TabNavigation({
  activeTab,
  onTabChange,
  showManageTab = false,
  children,
}: TabNavigationProps) {
  const tabs = showManageTab
    ? [
        ...TABS,
        { value: 'manage', label: 'Manage', shortLabel: 'Manage', icon: SlidersHorizontal },
      ]
    : TABS

  return (
    <div className="w-full">
      <div className="z-30 border-b border-border bg-background md:sticky md:top-16">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 py-2.5 [scrollbar-width:none] sm:px-4 sm:py-3 [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" />
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {children}
    </div>
  )
}
