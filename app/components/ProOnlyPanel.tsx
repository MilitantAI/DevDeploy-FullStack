"use client"
import type { ReactNode } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function ProOnlyPanel({ children }: { children: ReactNode }) {
  const ent = useQuery(api.entitlements.myEntitlements)
  const allowed = ent && (ent.status === 'active' || ent.status === 'trialing') && ent.plan === 'pro'
  if (!allowed) {
    return <a href="/pricing" className="underline">Upgrade to unlock</a>
  }
  return <>{children}</>
}
