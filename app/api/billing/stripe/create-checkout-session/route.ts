import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPlan } from '@/lib/pricing'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const envKey = process.env.STRIPE_SECRET_KEY
  if (!envKey) return new NextResponse('Missing STRIPE_SECRET_KEY', { status: 500 })

  const stripe = new Stripe(envKey)

  try {
    const body = await req.json().catch(() => ({}))
    const planId: 'basic' | 'pro' = body?.planId
    if (planId !== 'basic' && planId !== 'pro') {
      return new NextResponse('Invalid planId', { status: 400 })
    }

    const plan = getPlan(planId)
    if (!plan.stripe) {
      return new NextResponse('Pricing not configured for Stripe', { status: 500 })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.stripe, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      // Associate the Clerk user id for later linking in webhooks
      client_reference_id: userId,
      // Expand payment methods (Apple/Google Pay surface automatically if eligible)
      payment_method_types: ['card'],
      // Ensure subsequent subscription events include the Clerk user id
      subscription_data: {
        metadata: { clerkUserId: userId }
      }
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return new NextResponse(err?.message || 'Checkout error', { status: 500 })
  }
}


