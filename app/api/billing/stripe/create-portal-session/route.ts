import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return new NextResponse('Missing STRIPE_SECRET_KEY', { status: 500 })

  const customerId = await fetchQuery(api.entitlements.getStripeCustomerId, { subjectId: userId })
  if (!customerId) return new NextResponse('No Stripe customer found for user', { status: 404 })

  const stripe = new Stripe(key)
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/settings`
  })
  return NextResponse.json({ url: session.url })

  // Example once mapping exists:
  // const stripe = new Stripe(key)
  // const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin
  // const customerId = await getStripeCustomerIdForUser(userId) // Convex query
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: customerId,
  //   return_url: `${origin}/settings`
  // })
  // return NextResponse.json({ url: session.url })
}


