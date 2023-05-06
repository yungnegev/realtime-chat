import { z } from 'zod'
 
// Define a validation schema using zod, a TypeScript-first schema validation library
export const addFriendValidator = z.object({
    email: z.string().email(),
})