// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  items: defineTable({
    userId: v.string(),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_user_created", ["userId", "createdAt"]),
  
  files: defineTable({
    userId: v.string(),
    url: v.string(),     // public URL returned by UploadThing
    key: v.string(),     // provider file key
    name: v.string(),    // original filename
    size: v.number(),    // bytes
    type: v.string(),    // mime type
    uploadedAt: v.number()
  }).index('by_user_uploadedAt', ['userId', 'uploadedAt']),

  entitlements: defineTable({
    subjectId: v.string(),
    plan: v.union(v.literal('basic'), v.literal('pro')),
    status: v.union(
      v.literal('active'),
      v.literal('trialing'),
      v.literal('canceled'),
      v.literal('incomplete'),
      v.literal('past_due')
    ),
    currentPeriodEnd: v.optional(v.number()),
    ts: v.number()
  }).index('by_subject', ['subjectId', 'ts'])
  ,

  stripeCustomers: defineTable({
    subjectId: v.string(),
    customerId: v.string(),
    createdAt: v.number()
  })
    .index('by_subject', ['subjectId'])
    .index('by_customer', ['customerId'])
});
