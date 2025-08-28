'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
const proxyPath = '/_ph' // must match next.config.ts

export function PHProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const search = useSearchParams()
  const { user } = useUser()

  useEffect(() => {
    if (!key) return
    // Initialize once
    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: proxyPath, // proxied to avoid ad-blockers
        capture_pageview: false
      })
    }
  }, [])

  // Identify when user changes
  useEffect(() => {
    if (!user) return
    posthog.identify(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName
    })
  }, [user?.id])

  // Manual SPA pageview on route change
  useEffect(() => {
    posthog.capture('$pageview')
  }, [pathname, search])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}