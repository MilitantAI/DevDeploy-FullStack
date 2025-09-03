'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function SettingsPage() {
  const ent = useQuery(api.entitlements.myEntitlements)
  const planLabel = ent ? `${ent.plan} (${ent.status})` : 'Free'

  async function openPortal() {
    const res = await fetch('/api/billing/stripe/create-portal-session', { method: 'POST' })
    if (!res.ok) {
      const msg = await res.text().catch(() => 'Portal unavailable')
      alert(msg)
      return
    }
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <main className="mx-auto max-w-2xl space-y-8 p-8">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-600">Manage your account and billing.</p>
      </section>

      <section className="space-y-3 rounded border p-4">
        <h2 className="font-medium">Plan & Billing</h2>
        <p className="text-sm text-gray-600">Current plan: <span className="font-medium">{planLabel}</span></p>
        <div className="flex gap-2">
          <a className="rounded border px-3 py-2 text-sm" href="/pricing">Change plan</a>
          <button className="rounded bg-black px-3 py-2 text-sm text-white" onClick={openPortal}>
            Open Stripe customer portal
          </button>
        </div>
        {!ent && (
          <p className="text-xs text-gray-500">Upgrade on the pricing page to enable billing portal.</p>
        )}
      </section>

      <section className="space-y-3 rounded border p-4">
        <h2 className="font-medium">Profile</h2>
        <p className="text-sm text-gray-600">Update your email, password, and MFA in the Clerk modal.</p>
        <a className="rounded border px-3 py-2 text-sm" href="/sign-in">Open Clerk</a>
      </section>

      <section className="space-y-3 rounded border p-4">
        <h2 className="font-medium">Danger zone</h2>
        <p className="text-sm text-gray-600">Account deletion coming soon.</p>
      </section>
    </main>
  )
}


