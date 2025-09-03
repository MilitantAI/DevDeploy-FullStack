import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const upsertFromStripe = mutation({
  args: {
    subjectId: v.string(),
    plan: v.union(v.literal('basic'), v.literal('pro')),
    status: v.union(
      v.literal('active'),
      v.literal('trialing'),
      v.literal('canceled'),
      v.literal('incomplete'),
      v.literal('past_due')
    ),
    currentPeriodEnd: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('entitlements', {
      subjectId: args.subjectId,
      plan: args.plan,
      status: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      ts: Date.now()
    })
  }
})

export const myEntitlements = query({
  args: {},
  handler: async (ctx) => {
    const id = (await ctx.auth.getUserIdentity())?.subject
    if (!id) return null
    const [latest] = await ctx.db
      .query('entitlements')
      .withIndex('by_subject', (q) => q.eq('subjectId', id))
      .order('desc')
      .take(1)
    return latest ?? null
  }
})

export const upsertStripeCustomer = mutation({
  args: {
    subjectId: v.string(),
    customerId: v.string(),
  },
  handler: async (ctx, { subjectId, customerId }) => {
    const existing = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_subject', (q) => q.eq('subjectId', subjectId))
      .unique()
      .catch(() => null)

    if (existing) {
      // Update only if changed
      if (existing.customerId !== customerId) {
        await ctx.db.patch(existing._id, { customerId })
      }
      return
    }
    await ctx.db.insert('stripeCustomers', { subjectId, customerId, createdAt: Date.now() })
  }
})

export const getStripeCustomerId = query({
  args: { subjectId: v.string() },
  handler: async (ctx, { subjectId }) => {
    const rec = await ctx.db
      .query('stripeCustomers')
      .withIndex('by_subject', (q) => q.eq('subjectId', subjectId))
      .unique()
      .catch(() => null)
    return rec?.customerId ?? null
  }
})


