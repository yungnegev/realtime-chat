import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { fetchRedis } from '@/lib/redisHelperFunctionInApi'
import { Message, messageSchema } from '@/lib/validations/message'
import { nanoid } from 'nanoid'
import { getServerSession } from 'next-auth'

export async function POST(req: Request) {
    try { 
        const {text, chatId}: {text: string, chatId: string} = await req.json()
        const session = await getServerSession(authOptions)

        if (!session) return new Response('Unauthorized', {status: 401})

        const [userId1, userId2] = chatId.split('--')

        // making sure at least one of the chat ids match the user id
        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response('Unauthorized', {status: 401})
        }

        // making sure the user is friends with the other user in order to communicate
        const friendId = session.user.id === userId1 ? userId2 : userId1

        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string[]

        const isFriend = friendList.includes(friendId)

        if (!isFriend) return new Response('Unauthorized', {status: 401})

        const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string
        const sender = JSON.parse(rawSender) as User

        // all valid, send it
        const timestamp = Date.now()
        // using nanoid for unique id
        const messageData: Message = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp,
        }

        const message = messageSchema.parse(messageData)

        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, {status: 500})
        } 
        return new Response('Internal Server Error', {status: 500})
    }
}