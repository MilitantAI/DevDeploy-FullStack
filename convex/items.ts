import { mutation, query } from './_generated/server.js'
import { v } from 'convex/values'
import { addItemSchema } from '../lib/validation.js'


export const myItems = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) return []
        const userId = identity.subject
        return ctx.db
            .query('items')
            .withIndex('by_user_created', (q) => q.eq('userId', userId))
            .order('desc')
            .collect()
    }
})


export const addItem = mutation({
    args: { text: v.string() },
    handler: async (ctx, raw) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) throw new Error('unauthorized')

        const parsed = addItemSchema.safeParse(raw)
        if (!parsed.success) throw new Error('validation_failed')

        const userId = identity.subject
        await ctx.db.insert('items', { userId, text: parsed.data.text, createdAt: Date.now() })
    }
})