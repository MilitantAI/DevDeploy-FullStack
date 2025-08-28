import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { fetchMutation } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import { listPlans } from '@/lib/pricing'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const key = process.env.STRIPE_SECRET_KEY
  if (!secret || !key) {
    return new NextResponse('Stripe env not configured', { status: 500 })
  }

  const stripe = new Stripe(key)

  // Stripe sends the raw body for signature verification
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err: any) {
    return new NextResponse(`Invalid signature: ${err.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // client_reference_id contains Clerk user id we set during checkout
        const subjectId = session.client_reference_id
        const subscriptionId = session.subscription as string | null
        if (!subjectId || !subscriptionId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const status = normalizeStatus(sub.status)
        const plan = extractPlanTier(sub)
        const periodEndSec = (sub as any).current_period_end ?? (sub as any).currentPeriodEnd
        const currentPeriodEnd = periodEndSec ? Number(periodEndSec) * 1000 : undefined

        if (plan) {
          await fetchMutation(api.entitlements.upsertFromStripe, {
            subjectId,
            plan,
            status,
            currentPeriodEnd
          })
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.created':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const subjectId = (sub.metadata && sub.metadata['clerkUserId']) || undefined
        // If no explicit metadata, we cannot map reliably without a customer mapping layer.
        if (!subjectId) break
        const status = normalizeStatus(sub.status)
        const plan = extractPlanTier(sub)
        const periodEndSec = (sub as any).current_period_end ?? (sub as any).currentPeriodEnd
        const currentPeriodEnd = periodEndSec ? Number(periodEndSec) * 1000 : undefined
        if (plan) {
          await fetchMutation(api.entitlements.upsertFromStripe, {
            subjectId,
            plan,
            status,
            currentPeriodEnd
          })
        }
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return new NextResponse(err?.message || 'Webhook handler error', { status: 500 })
  }
}

type Tier = 'basic' | 'pro'

const priceIdToTier = (() => {
  const m = new Map<string, Tier>()
  for (const p of listPlans()) {
    if (p.stripe) m.set(p.stripe, p.tier as Tier)
  }
  return m
})()

function extractPlanTier(sub: Stripe.Subscription): Tier | null {
  const item = sub.items.data[0]
  const priceId = item?.price?.id
  if (priceId && priceIdToTier.has(priceId)) return priceIdToTier.get(priceId)!
  // Fallback to nickname if needed
  const nickname = item?.price?.nickname?.toLowerCase()
  if (nickname === 'basic') return 'basic'
  if (nickname === 'pro') return 'pro'
  return null
}

function normalizeStatus(s: Stripe.Subscription.Status) {
  switch (s) {
    case 'active':
      return 'active' as const
    case 'trialing':
      return 'trialing' as const
    case 'canceled':
      return 'canceled' as const
    case 'incomplete':
      return 'incomplete' as const
    case 'past_due':
      return 'past_due' as const
    default:
      // map other statuses to closest variant
      return 'incomplete' as const
  }
}


