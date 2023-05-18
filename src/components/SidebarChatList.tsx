'use client'

import { chatHrefConstructor, replaceColons } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { pusherClient } from '@/lib/pusher'

interface SidebarChatListProps {
    friends: User[]
    sessionId: string
}

const SidebarChatList = ({friends, sessionId}: SidebarChatListProps) => {

  // we need the router to be able to tell whether or not the user has seen the messages (navigated to the chat)

  const pathname = usePathname()
  // we will save the messages in state, however we wont have message notifications from the server
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

  // realtime message functionality, it is done here because this component is always mounted
  useEffect(() => {
    pusherClient.subscribe(replaceColons(`user:${sessionId}:chats`))
  }, [])

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