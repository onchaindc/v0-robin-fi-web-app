'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MyVaultsView } from './views/my-vaults-view'
import { CreateVaultView } from './views/create-vault-view'
import { ExploreVaultsView } from './views/explore-vaults-view'
import { ManageVaultView } from './views/manage-vault-view'

export function TabNavigation() {
  return (
    <Tabs defaultValue="my-vaults" className="w-full">
      <TabsList className="w-full justify-start border-b border-robin-gray-dark bg-transparent p-0 rounded-none h-auto">
        <TabsTrigger 
          value="my-vaults"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-robin-teal data-[state=active]:bg-transparent px-4 py-3 cursor-pointer"
        >
          My Vaults
        </TabsTrigger>
        <TabsTrigger 
          value="create"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-robin-teal data-[state=active]:bg-transparent px-4 py-3 cursor-pointer"
        >
          Create Vault
        </TabsTrigger>
        <TabsTrigger 
          value="explore"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-robin-teal data-[state=active]:bg-transparent px-4 py-3 cursor-pointer"
        >
          Explore Vaults
        </TabsTrigger>
        <TabsTrigger 
          value="manage"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-robin-teal data-[state=active]:bg-transparent px-4 py-3 cursor-pointer"
        >
          Manage Vault
        </TabsTrigger>
      </TabsList>

      <TabsContent value="my-vaults">
        <MyVaultsView />
      </TabsContent>

      <TabsContent value="create">
        <CreateVaultView />
      </TabsContent>

      <TabsContent value="explore">
        <ExploreVaultsView />
      </TabsContent>

      <TabsContent value="manage">
        <ManageVaultView />
      </TabsContent>
    </Tabs>
  )
}
