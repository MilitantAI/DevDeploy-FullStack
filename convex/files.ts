import { query, mutation } from './_generated/server.js'
import { v } from 'convex/values'

export const myFiles = query({
  args: {},
  handler: async (ctx) => {
    const id = (await ctx.auth.getUserIdentity())?.subject
    if (!id) return []
    return ctx.db
      .query('files')
      .withIndex('by_user_uploadedAt', (q) => q.eq('userId', id))
      .order('desc')
      .collect()
  }
})

export const recordUpload = mutation({
  args: {
    userId: v.string(),
    url: v.string(),
    key: v.string(),
    name: v.string(),
    size: v.number(),
    type: v.string()
  },
  handler: async (ctx, args) => {
    const uid = (await ctx.auth.getUserIdentity())?.subject
    if (!uid) throw new Error('unauthorized')
    if (uid !== args.userId) throw new Error('forbidden')
    await ctx.db.insert('files', {
      userId: uid,
      url: args.url,
      key: args.key,
      name: args.name,
      size: args.size,
      type: args.type,
      uploadedAt: Date.now()
    })
  }
})

export const remove = mutation({
  args: { id: v.id('files') },
  handler: async (ctx, { id }) => {
    const uid = (await ctx.auth.getUserIdentity())?.subject
    if (!uid) throw new Error('unauthorized')
    const row = await ctx.db.get(id)
    if (!row || row.userId !== uid) throw new Error('forbidden')
    await ctx.db.delete(id)
  }
})

