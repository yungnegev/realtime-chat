'use client'

import { chatHrefConstructor, replaceColons } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { pusherClient } from '@/lib/pusher'
import toast from 'react-hot-toast'
import UnseenToast from './UnseenToast'

interface SidebarChatListProps {
    friends: User[]
    sessionId: string
}
// a type for the message and the additional pic and name of the sender for the notification
interface ExtendedMessage extends Message {
  senderName: string
  senderImg: string
}

const SidebarChatList = ({friends, sessionId}: SidebarChatListProps) => {

  // we need the router to be able to tell whether or not the user has seen the messages (navigated to the chat)
  const router = useRouter()
  const pathname = usePathname()
  // we will save the messages in state, however we wont have message notifications from the server
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

  // realtime message functionality, it is done here because this component is always mounted
  useEffect(() => {
    pusherClient.subscribe(replaceColons(`user:${sessionId}:chats`))
    pusherClient.subscribe(replaceColons(`user:${sessionId}:friends`))

    const friendHandler = () => {
      router.refresh()
    }

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

      if (!shouldNotify) return

      toast.custom((t) => (
        // custom component for the toast
        <UnseenToast 
            t={t}
            sessionId={sessionId}
            senderId={message.senderId} 
            senderImg={message.senderImg}
            senderName={message.senderName}
            senderMessage={message.text}
            />
      ))
      setUnseenMessages((prev) => [...prev, message])
    }

    pusherClient.bind('new_message', chatHandler)
    pusherClient.bind('new_friend', friendHandler)

    return () => {
      pusherClient.unsubscribe(replaceColons(`user:${sessionId}:chats`))
      pusherClient.unsubscribe(replaceColons(`user:${sessionId}:friends`))
    }
  }, [pathname, sessionId, router])

  // a quik useeffect that will run everytime the pathname changes
  useEffect(() => {
    if (pathname?.includes('chat')) {
      setUnseenMessages((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId))
      })
    }
  }, [pathname])

  return (
    <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
        {
            friends.sort().map((friend) => {
              const unseenMessageCount = unseenMessages.filter((unseenMsg) => {
                return unseenMsg.senderId === friend.id
              }).length
                return (
                  <li key={friend.id} >
                    <a 
                      href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}
                      className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-3 rounded-md p-2 text-sm leading-6 font-semibold'
                    >
                      <Image referrerPolicy='no-referrer' src={friend.image} alt='img' className='rounded-full' height={24} width={24}/>
                      <span className='w-36 truncate'>{friend.name}</span>
                      {unseenMessageCount > 0 && (
                        <span className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                          {unseenMessageCount}
                        </span>
                      )}
                    </a>
                  </li>
                )
            })
        }
    </ul>
  )
}

export default SidebarChatList