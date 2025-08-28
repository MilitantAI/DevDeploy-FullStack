'use client'
import { useFeatureFlagEnabled } from 'posthog-js/react'

export default function FeatureFlagPanel({ flagKey }: { flagKey: string }) {
  const enabled = useFeatureFlagEnabled(flagKey)
  if (!enabled) return null
  return (
    <aside className="rounded border p-3 bg-amber-50">
      <p className="text-sm">Feature flag "{flagKey}" is <strong>enabled</strong>.</p>
    </aside>
  )
}