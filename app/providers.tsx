// app/providers.tsx
'use client'

import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { PHProvider } from '@/lib/posthog'
import { convex } from '@/lib/convexClient'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <PHProvider>{children}</PHProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}
