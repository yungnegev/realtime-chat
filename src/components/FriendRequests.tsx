'use client'

import { pusherClient } from '@/lib/pusher';
import { replaceColons } from '@/lib/utils';
import axios from "axios"
import router from 'next/router';
import { useEffect, useState } from "react"
import { FaUserFriends } from 'react-icons/fa'
import { TfiClose, TfiCheck } from 'react-icons/tfi'

interface FriendRequestProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequests = ({ incomingFriendRequests, sessionId }:FriendRequestProps) => {

  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)

  useEffect(() => {
    pusherClient.subscribe(replaceColons(`user:${sessionId}:incoming_friend_requests`))
    const friendRequestHandler = ({senderId, senderEmail}: IncomingFriendRequest) => {
      setFriendRequests((prev) => [...prev, {senderId, senderEmail}])
    }
    pusherClient.bind(`incoming_friend_requests`, friendRequestHandler)

    return () => {
        pusherClient.unsubscribe(replaceColons(`user:${sessionId}:incoming_friend_requests`))
        pusherClient.unbind(`incoming_friend_requests`, friendRequestHandler)
    }
  }, [])

  const acceptFriend = async (senderId: string) => {
    await axios.post('/api/friends/accept', {id: senderId})
    setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
    router.reload()
  }

  const denyFriend = async (senderId: string) => {
    await axios.post('/api/friends/deny', {id: senderId})
    setFriendRequests((prev) => prev.filter((request) => request.senderId !== senderId))
    router.reload()
  }

  return (
    <>
    {
        friendRequests.length == 0 
            ? (
                <span className='text-gray-500 tracking-wider font-semibold text-sm'>NOTHING TO SHOW HERE</span>
            ) 
            : (
                friendRequests.map((request) => {
                    return (
                        <div key={request.senderId} className='flex gap-4 items-center'>
                            <FaUserFriends className='text-black' size={20}/>
                            <span className='font-medium text-lg'>{request.senderEmail}</span>
                            <button 
                                aria-label='accept' 
                                className='w-6 h-6 bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center rounded-full transition hover:shadow-md'
                                onClick={() => acceptFriend(request.senderId)}
                                >
                                <TfiCheck className='text-white w-3/4 h-3/4'/>
                            </button>
                            <button 
                                aria-label='deny' 
                                className='w-6 h-6 bg-rose-600 hover:bg-rose-700 flex justify-center items-center rounded-full transition hover:shadow-md'
                                onClick={() => denyFriend(request.senderId)}
                                >
                                <TfiClose className='text-white w-3/4 h-3/4'/>
                            </button>
                        </div>
                    )
                })
            )
    }
    </>
  )
}

export default FriendRequests