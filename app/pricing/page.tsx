'use client'

import { useEffect, useRef } from 'react'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { listPlans } from '@/lib/pricing'
import { loadStripe, Stripe } from '@stripe/stripe-js'

const PUB_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function PricingPage() {
  const stripeRef = useRef<Stripe | null>(null)
  const plans = listPlans() // from lib/pricing.ts (dev/prod aware, validated)

  // Preload Stripe.js if a key is set
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!PUB_KEY) return
      const stripe = await loadStripe(PUB_KEY)
      if (mounted) stripeRef.current = stripe
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Calls our server route (auth enforced server-side via Clerk)
  async function startStripeCheckout(tier: 'basic' | 'pro') {
    const res = await fetch('/api/billing/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: tier })
    })

    if (res.status === 401) {
      // Not signed in: the SignedOut block already shows a Sign In button.
      // We also nudge the user here as a fail-safe.
      alert('Please sign in to continue.')
      return
    }

    if (!res.ok) {
      const msg = await res.text().catch(() => 'Checkout error')
      alert(msg || 'Checkout error')
      return
    }

    const { url } = await res.json()
    // Stripe Checkout is a hosted page; just redirect
    window.location.href = url
  }

  return (
    <main className="mx-auto max-w-3xl p-8 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Choose a plan</h1>
        <p className="text-sm text-gray-600">
          Payments are processed by Stripe. Apple&nbsp;Pay / Google&nbsp;Pay appear automatically when eligible.
        </p>
        {!PUB_KEY && (
          <p className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">
            Missing <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>. Set it to enable checkout.
          </p>
        )}
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        {plans.map((p) => (
          <div key={p.tier} className="rounded border p-4">
            <h2 className="text-lg font-medium">{p.label}</h2>
            <p className="text-sm text-gray-600">
              {p.interval} • {p.currency}
              {p.trialDays ? ` • ${p.trialDays}-day trial` : ''}
            </p>

            <div className="mt-4 space-y-2">
              {/* Signed-in users can start checkout */}
              <SignedIn>
                <button
                  disabled={!PUB_KEY}
                  onClick={() => startStripeCheckout(p.tier)}
                  className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                  Continue with Stripe
                </button>
              </SignedIn>

              {/* Signed-out users see a Sign In first */}
              <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl="/pricing" signUpForceRedirectUrl="/pricing">
                  <button className="w-full rounded border px-4 py-2">
                    Sign in to purchase
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
