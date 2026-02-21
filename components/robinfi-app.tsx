'use client'

import { Header } from './header'
import { TabNavigation } from './tab-navigation'

export function RobinFiApp() {
  return (
    <div className="min-h-screen bg-robin-dark">
      <Header />
      <main className="py-8">
        <TabNavigation />
      </main>
    </div>
  )
}
