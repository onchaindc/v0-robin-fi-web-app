'use client'

import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Header } from './header'
import { TabNavigation } from './tab-navigation'
import { WelcomeView } from './views/welcome-view'
import { MyVaultsView } from './views/my-vaults-view'
import { CreateVaultView } from './views/create-vault-view'
import { ExploreVaultsView } from './views/explore-vaults-view'
import { ManageVaultView } from './views/manage-vault-view'

export function RobinFiApp() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('home')
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleSelectVault = (vaultId: string) => {
    setSelectedVaultId(vaultId)
    setActiveTab('manage')
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {!isConnected ? (
        <WelcomeView />
      ) : (
        <main className="py-8">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} showManageTab={!!selectedVaultId}>
            <div className="max-w-6xl mx-auto px-4">
              {activeTab === 'my-vaults' && <MyVaultsView onSelectVault={handleSelectVault} />}
              {activeTab === 'create' && <CreateVaultView />}
              {activeTab === 'explore' && <ExploreVaultsView onSelectVault={handleSelectVault} />}
              {activeTab === 'manage' && selectedVaultId && (
                <ManageVaultView vaultId={selectedVaultId} />
              )}
            </div>
          </TabNavigation>
        </main>
      )}
    </div>
  )
}
