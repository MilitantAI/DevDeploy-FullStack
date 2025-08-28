import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ItemClient from '@/app/components/ItemClient'
import FeatureFlagPanel from '@/app/components/FeatureFlagPanel'
import Uploader from '@/app/components/Uploader'
import FileList from '@/app/components/FileList'
import ProOnlyPanel from '@/app/components/ProOnlyPanel'


export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <ProOnlyPanel>
        <p className="text-sm">This is a premium-only widget.</p>
      </ProOnlyPanel>

      <Uploader />
      <FileList />

      <ItemClient />
      <FeatureFlagPanel flagKey="beta-panel" />
    </main>
  )
}