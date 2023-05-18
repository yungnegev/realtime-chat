'use client'

import { useEffect, useRef, useState } from 'react'
import type { Message } from '../lib/validations/message' // absolutely nasty
import { cn, replaceColons } from '@/lib/utils'
import { format } from 'date-fns'
import { pusherClient } from '@/lib/pusher'


interface MessagesProps {
    initialMessages: Message[] // nasty ass validation inferred type living somewhere deep in lib
    sessionId: string
    chatId: string
}

const Messages = ({ initialMessages, sessionId, chatId }:MessagesProps) => {
  
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  useEffect(() => {
    pusherClient.subscribe(replaceColons(`chat:${chatId}`))

    const messageHandler = (message: Message) => {
      setMessages((prev) => [message, ...prev])
    }

    pusherClient.bind(`incoming-message`, messageHandler)

    return () => {
        pusherClient.unsubscribe(replaceColons(`chat:${chatId}`))
        pusherClient.unbind(`incoming-message`, messageHandler)
    }
  },[])
  
  const scrollDownRef = useRef<HTMLDivElement | null>(null)

  const formatTimestamp = (timestamp: number) => {
    return format(timestamp, 'HH:mm')
  }

  return (
    <div id='messages' className='flex flex-1 h-full flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch '>
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        // which go left and which go right 
        const isCurrentUser = message.senderId === sessionId
        const hasNextMessageFromSameUser = messages[index - 1]?.senderId === messages[index].senderId
        return (
            <div key={index} id='chat-message'>
                <div className={cn('flex items-end', {
                    'justify-end': isCurrentUser
                })}>
                    <div className={cn('flex flex-col space-y-2 text-base max-w-xs mx-2', {
                        'order-1 items-end': isCurrentUser,
                        'order-2 items-start': !isCurrentUser
                    })}>
                        <span className={cn('px-4 py-2 rounded-lg inline-block', {
                            'bg-indigo-600 text-white': isCurrentUser,
                            'bg-gray-200 text-gray-900': !isCurrentUser,
                            'rounded-br-none': !hasNextMessageFromSameUser && isCurrentUser,
                            'rounded-bl-none': !hasNextMessageFromSameUser && !isCurrentUser
                        })}>
                            {message.text}{' '} 
                            <span className='ml-2 text-[10px] text-gray-300'>{formatTimestamp(message.timestamp)}</span>
                        </span>
                    </div>
                </div>
            </div>
        )
      })}
    </div>
  )
}

export default Messages