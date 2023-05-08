import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { z } from "zod"

export async function POST(req: Request) {
    try {

        // get the body of the request and the current session
        const body = await req.json()
        const session = await getServerSession(authOptions)
        if(!session) {
            return new Response('Unauthorized', { status: 401 })
        }

        // get the id we are removing
        const { id: idToDeny } = z.object({ id: z.string() }).parse(body)

        // remove the id from the pending friend requests
        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToDeny)


        return new Response('OK', { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid request content.', { status: 422 })
        }
        return new Response('Invalid request.', { status: 400 })
    }
}