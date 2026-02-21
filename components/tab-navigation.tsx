'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  showManageTab?: boolean
  children: React.ReactNode
}

export function TabNavigation({ activeTab, onTabChange, showManageTab = false, children }: TabNavigationProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="max-w-6xl mx-auto px-4">
        <TabsList className="w-full justify-start border-b border-border bg-transparent p-0 rounded-none h-auto gap-1">
          <TabsTrigger 
            value="my-vaults"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 cursor-pointer text-sm font-medium transition-colors hover:text-primary"
          >
            My Vaults
          </TabsTrigger>
          <TabsTrigger 
            value="create"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 cursor-pointer text-sm font-medium transition-colors hover:text-primary"
          >
            Create Vault
          </TabsTrigger>
          <TabsTrigger 
            value="explore"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 cursor-pointer text-sm font-medium transition-colors hover:text-primary"
          >
            Explore Vaults
          </TabsTrigger>
          {showManageTab && (
            <TabsTrigger 
              value="manage"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 cursor-pointer text-sm font-medium transition-colors hover:text-primary"
            >
              Manage Vault
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      {children}
    </Tabs>
  )
}
