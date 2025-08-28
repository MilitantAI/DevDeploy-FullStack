// convex/projects.ts
import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { requirePlan } from './guards'

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await requirePlan(ctx, 'pro')
    // proceed with write for userId
  }
})
