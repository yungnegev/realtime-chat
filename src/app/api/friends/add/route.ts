import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { fetchRedis } from "@/lib/redisHelperFunctionInApi"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { z } from "zod"

// a lot of these next.js requests are cached so we will need workarounds to make sure we don't get stale data

export async function POST (req: Request, res: Response) {
    try {
        // body of the post request
        const body = await req.json()

        // get the email and validate it again with the same validator used in the frontend (parse)
        const { email: emailToAdd } = addFriendValidator.parse(body.email)

        // get the rest response from our upstash database
        // url for the upstash database is in the .env file, the get/user:email:${emailToAdd} is where in the database we are fetching from
        // using headers to authenticate the request
        // use cache no store to make sure we don't get any nextjs caching and the data is never stale
        const RESTresponse = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`, {
            headers: {
                Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
            },
            cache: 'no-store',
        })

        // await the respose 
        /// this particular response is an object, it has a result property which is a string (the ID of the email that we sent it)
        const data = await RESTresponse.json() as {result: string | null} // the result is a string
        const idToAdd = data.result // the id we want to add
        // if the id is null
        if (!idToAdd) {
            return new Response('User not found', {status: 400})
        }
        // get the session from next-auth in order to see if the user is even authorised to make the request
        const session = await getServerSession(authOptions)
        // if the session is null
        if (!session) {
            // return a 401 error in a next-js response
            return new Response('Unauthorized', {status: 401})
        }
        // if the user is trying to add themselves
        if (idToAdd === session.user.id) {
            return new Response('You cannot add yourself', {status: 400})
        }
        // check if you already added the user and he has not accepted yet
        const isAdded = await (fetchRedis('sismember', `user:${idToAdd}:incoming_friend_requests`, session.user.id)) as 0 | 1
        if (isAdded) {
            return new Response('User already added.', {status: 400})
        }
        // check if user is already added again but this time in your friends list
        const isFriends = await (fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd)) as 0 | 1
        if (isFriends) {
            return new Response('User already in friends list.', {status: 400})
        }
        // add the user to the incoming friend requests list in the db (valid request)
        db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id)
        // return a 200 response
        return new Response('OK', {status: 200})
    } catch (error) {
        // parsing error from zod on line 16 would throw a zod error if the email is invalid (422 unparsable entity)
        if (error instanceof z.ZodError) {
            return new Response('Invalid request payload.', {status: 422})
        }
        // else return a generic error
        return new Response('Invalid request.', {status: 400})
    }
}