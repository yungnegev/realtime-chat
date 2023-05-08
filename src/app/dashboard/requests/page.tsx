import FriendRequests from "@/components/FriendRequests"
import { authOptions } from "@/lib/auth"
import { fetchRedis } from "@/lib/redisHelperFunctionInApi"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

 

const RuequestsPage = async () => {
  
  const session = await getServerSession(authOptions) 
  if (!session) notFound()  

  // we need to get the ids of people who sent current logged in user friend requests  
  const incomingSenderIds = (await fetchRedis(
        'smembers', 
        `user:${session.user.id}:incoming_friend_requests`
        )) as string[]
  // incoming_friend_requests is a set of user ids as strings, so we need to cast it to string[]
  // from those ids we need to get the user and their emails
  // we need to query for those users to the db and so we need to make a bunch of promises happen
  // to make them simultaneous we use Promise.all
  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (id) => {
        const sender = await fetchRedis('get', `user:${id}`) as string
        // then convert the string to an object
        const senderObj = JSON.parse(sender) as User
        return {
            senderId: id,
            senderEmail: senderObj.email,
        }
    })
  )

  return (
    <main className='pt-8'>
        <h2 className='font-bold text-5xl mb-8'>Friend requests</h2>
        <div className='flex flex-col gap-4'>
            <FriendRequests sessionId={session.user.id} incomingFriendRequests={incomingFriendRequests}/>
        </div>
    </main>
  )
}

export default RuequestsPage