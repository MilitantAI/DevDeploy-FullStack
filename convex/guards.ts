// convex/guards.ts
// convex guards for premium feature gating

export async function requirePlan(ctx: any, plan: string) {
  const id = (await ctx.auth.getUserIdentity())?.subject
  if (!id) throw new Error('unauthorized')
  const [e] = await ctx.db
    .query('entitlements')
    .withIndex('by_subject', (q: any) => q.eq('subjectId', id))
    .order('desc')
    .take(1)
  const active = e && (e.status === 'active' || e.status === 'trialing')
  if (!active || e.plan !== plan) throw new Error('forbidden')
  return id
}
