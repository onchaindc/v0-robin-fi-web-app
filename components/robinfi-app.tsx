'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Header } from './header'
import { TabNavigation } from './tab-navigation'
import { Landing } from './landing'
import { MyVaultsView } from './views/my-vaults-view'
import { CreateVaultView } from './views/create-vault-view'
import { ExploreVaultsView } from './views/explore-vaults-view'
import { ManageVaultView } from './views/manage-vault-view'

export function RobinFiApp() {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('my-vaults')
  const [selectedVault, setSelectedVault] = useState<string | null>(null)

  const handleSelectVault = (vaultAddress: string) => {
    setSelectedVault(vaultAddress)
    setActiveTab('manage')
  }

  const handleCreated = (vaultAddress: string) => {
    setSelectedVault(vaultAddress)
    setActiveTab('manage')
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header showNav />
        <Landing />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          showManageTab={Boolean(selectedVault)}
        >
          <div className="mx-auto max-w-6xl px-4 pt-10">
            {activeTab === 'my-vaults' && (
              <MyVaultsView
                onSelectVault={handleSelectVault}
                onCreate={() => setActiveTab('create')}
                onExplore={() => setActiveTab('explore')}
              />
            )}
            {activeTab === 'explore' && (
              <ExploreVaultsView onSelectVault={handleSelectVault} />
            )}
            {activeTab === 'create' && <CreateVaultView onCreated={handleCreated} />}
            {activeTab === 'manage' && selectedVault && (
              <ManageVaultView vaultAddress={selectedVault as `0x${string}`} />
            )}
          </div>
        </TabNavigation>
      </main>
    </div>
  )
}
