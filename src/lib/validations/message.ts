import { type } from 'os'
import { z } from 'zod'

export const messageSchema = z.object({
    id: z.string(),
    senderId: z.string(),
    text: z.string().max(2000),
    timestamp: z.number(),
})

export const messageArrayValidator = z.array(messageSchema)

export type Message = z.infer<typeof messageSchema>