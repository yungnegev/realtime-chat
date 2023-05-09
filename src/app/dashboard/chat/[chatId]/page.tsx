
// the way dynamic pages work is that they provide you with params in your props, very chill 

import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { fetchRedis } from '@/lib/redisHelperFunctionInApi'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Messages from '@/components/Messages'
import ChatInput from '@/components/ChatInput'

// whatever the name of the folder is, is the name of the param
interface ChatProps {
  params: {
    chatId: string
  }
}


// fetching the messages outside of the component for cleaner code
const getChatMessages = async (chatId: string) => {
  try {
    // zrange is a list that comes from redis, it's a sorted set, a redis structure, we also need to provide the range, 0 to -1 means all of them
    const result: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1) 
    // now the strings that we get from the db need to be parsed into the actual messages
    const dbMessages = result.map((message) => JSON.parse(message) as Message)
    // reverse the messages since the db is sorted from oldest to newest, but we want to display the newest first
    const reverssedDbMessages = dbMessages.reverse()
    // finally we get the messages validated with zod
    const messages = messageArrayValidator.parse(reverssedDbMessages)
    
    return messages

  } catch (error) {
    notFound()
  }
}


const Chat = async ({params}:ChatProps) => {
  
  const chatId = params.chatId
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const user = session.user

  // the chat url will be comprised of two user ids separated by a '--', they need to come in a consistent order
  // to make sure we don't get a 1--2 and a 2--1 situtation. So we'll sort the ids before we join them with a '--'
  const [userId1, userId2] = chatId.split('--')

  // your current session user id needs to correspond to one of the ids in the chatId, otherwise you sholdnt be able to view the chat
  if (userId1 !== user.id && userId2 !== user.id) notFound()

  // considering that the id's are uniformly sorted in the chatid beforehand, we need to know which id corresponds to which user
  const partnerUserId = userId1 === user.id ? userId2 : userId1
  // now we need to get his email to display
  const partnerUser = (await db.get(`user:${partnerUserId}`)) as User
  // getting the chat messages
  const initialChatMessages = await getChatMessages(chatId)

  
  return (
    <div className='flex flex-col flex-1 justify-between h-full max-h-[calc(100vh-6rem)]'>
      <div className='flex sm:items-center justify-between py-3 border-b border-gray-300'>
        <div className='relative flex items-center space-x-4 ml-4'>
          <div className='relative'>
            <div className='relative w-8 sm:w-12 h-8 sm:h-12 '>
              <Image fill referrerPolicy='no-referrer' src={partnerUser.image} alt='img' className='rounded-full'/>
            </div>
          </div>
          <div className='flex flex-col leading-tight'>
            <div className='text-xl flex items-center'>
              <span className='text-gray-700 mr-3 font-semibold'>{partnerUser.name}</span>
            </div>
            <span className='text-sm text-gray-500'>{partnerUser.email}</span>
          </div>
        </div>
      </div>
      <Messages initialMessages={initialChatMessages} sessionId={session.user.id} />
      <ChatInput chatPartner={partnerUser} chatId={chatId} />
    </div>
  )
}

export default Chat