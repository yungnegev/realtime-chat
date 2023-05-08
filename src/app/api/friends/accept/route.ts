import { fetchRedis } from '@/lib/redisHelperFunctionInApi'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body)

    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response('Unauthorized', { status: 401 })
    }

    // verify both users are not already friends
    const isAlreadyFriends = await fetchRedis(
      'sismember',
      `user:${session.user.id}:friends`,
      idToAdd
    )

    if (isAlreadyFriends) {
      return new Response('Already friends', { status: 400 })
    }

    const hasFriendRequest = await fetchRedis(
      'sismember',
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    )

    if (!hasFriendRequest) {
      return new Response('No friend request', { status: 400 })
    }

    // add usser to friends list
    await db.sadd(`user:${session.user.id}:friends`, idToAdd)
    await db.sadd(`user:${idToAdd}:friends`, session.user.id)

    // remove the user from the pending request list
    await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)

    return new Response('OK')
  } catch (error) {

    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }

    return new Response('Invalid request', { status: 400 })
  }
}







// import { authOptions } from '@/lib/auth'
// import { db } from '@/lib/db'
// import { fetchRedis } from '@/lib/redisHelperFunctionInApi'
// import { getServerSession } from 'next-auth'
// import { z } from 'zod'

// export async function POST(req: Request, res: Response) {
//     try {
//         const body = await req.json()

//         // making sure it is a valid string
//         const { id: idToAdd } = z.object({id: z.string()}).parse(body) 

//         const session = await getServerSession(authOptions)
//         // making sure the user is logged in
//         if (!session) return new Response('Unauthorized', {status: 401})

//         // verify whether the users are already friends
//         const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`)
//         if (isAlreadyFriends) return new Response('Already friends', {status: 400})

//         // verify whether the user is already in the pending rquest list, the user has to send the request first and then get accepted
//         const isAlreadyPending = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd)
//         if (!isAlreadyPending) return new Response('No friend request.', {status: 400})

//         // add the user to the friend list in the database
//         // redis is a weird non relational db so we need to add both the users to each other's friend list
//         await db.sadd(`user:${session.user.id}:friends`, idToAdd)
//         await db.sadd(`user:${idToAdd}:friends`, session.user.id)

//         // remove the user from the pending request list
//         await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)

//         // return ok 
//         return new Response('OK', {status: 200})
//     } catch (error) {
//         if (error instanceof z.ZodError) return new Response('Invalid request (unprocessable)', {status: 422})
//         return new Response('Invalid request xd.', {status: 400})
//     }
// }