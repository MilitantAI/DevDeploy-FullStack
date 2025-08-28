// lib/pricing.ts
type Tier = 'basic' | 'pro'
type Provider = 'stripe' | 'paypal'
type Env = 'dev' | 'prod'

/** Explicit environment switch (don’t guess) */
const APP_ENV: Env =
  (process.env.NEXT_PUBLIC_APP_ENV === 'prod' ? 'prod' : 'dev')

/** Guard: fail hard if placeholders are still present */
function assertRealId(id: string, hint: string) {
  if (!id || /TODO|REPLACE|CHANGE_ME/i.test(id)) {
    throw new Error(`Pricing ID not set for ${hint}. Replace placeholders in lib/pricing.ts`)
  }
}

/** Optional: pattern sanity checks (vague on purpose—IDs can vary) */
function checkStripe(id: string) {
  if (!/^price_/.test(id)) throw new Error(`Stripe price id looks wrong: ${id}`)
}
function checkPayPal(id: string) {
  if (!/^P-/.test(id)) throw new Error(`PayPal plan id looks wrong: ${id}`)
}

export interface PlanIds {
  stripe?: string
  paypal?: string
  currency: 'USD' | 'EUR' | 'AUD' | 'GBP' // extend as needed
  interval: 'month' | 'year'
  label: string
  trialDays?: number
}

/** Single source of truth: per-env plan maps */
const PRICING: Record<Env, Record<Tier, PlanIds>> = {
  dev: {
    basic: {
      label: 'Basic',
      interval: 'month',
      currency: 'USD',
      trialDays: 0,
      // Stripe test price ID & PayPal SANDBOX plan ID go here:
      stripe: 'price_TODO_REPLACE_WITH_TEST_ID',
      paypal: 'P-TODO_REPLACE_WITH_SANDBOX_ID',
    },
    pro: {
      label: 'Pro',
      interval: 'month',
      currency: 'USD',
      trialDays: 14,
      stripe: 'price_TODO_REPLACE_WITH_TEST_ID',
      paypal: 'P-TODO_REPLACE_WITH_SANDBOX_ID',
    },
  },
  prod: {
    basic: {
      label: 'Basic',
      interval: 'month',
      currency: 'USD',
      stripe: 'price_TODO_REPLACE_WITH_LIVE_ID',
      paypal: 'P-TODO_REPLACE_WITH_LIVE_ID',
    },
    pro: {
      label: 'Pro',
      interval: 'month',
      currency: 'USD',
      stripe: 'price_TODO_REPLACE_WITH_LIVE_ID',
      paypal: 'P-TODO_REPLACE_WITH_LIVE_ID',
    },
  },
}

/** Public API */
export function getPlan(tier: Tier): PlanIds {
  const plan = PRICING[APP_ENV][tier]
  if (!plan) throw new Error(`Unknown tier: ${tier}`)
  // Fail early if placeholders remain
  if (plan.stripe) { assertRealId(plan.stripe, `${APP_ENV}/${tier}/stripe`); checkStripe(plan.stripe) }
  if (plan.paypal) { assertRealId(plan.paypal, `${APP_ENV}/${tier}/paypal`); checkPayPal(plan.paypal) }
  return plan
}

export function listPlans(): Array<{ tier: Tier } & PlanIds> {
  return (Object.keys(PRICING[APP_ENV]) as Tier[]).map(tier => ({ tier, ...PRICING[APP_ENV][tier] }))
}

/** Helper for env switching in UI/tests */
export const IS_PROD = APP_ENV === 'prod'
export const APP_ENV_EXPLAIN = APP_ENV // expose for debugging
