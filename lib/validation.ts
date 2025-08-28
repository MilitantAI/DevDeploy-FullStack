import { z } from 'zod'

export const addItemSchema = z.object({
  text: z.string().trim().min(1).max(500)
})
export type AddItemInput = z.infer<typeof addItemSchema>