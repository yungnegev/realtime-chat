'use client'

import { useState } from "react"
import { FiUserPlus } from 'react-icons/fi'
import { TfiClose, TfiCheck } from 'react-icons/tfi'

interface FriendRequestProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequests = ({ incomingFriendRequests, sessionId }:FriendRequestProps) => {

  const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)

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
                            <FiUserPlus className='text-black' size={28}/>
                            <span className='font-medium text-lg'>{request.senderEmail}</span>
                            <button aria-label='accept' className='w-6 h-6 bg-indigo-600 hover:bg-indigo-700 flex justify-center items-center rounded-full transition hover:shadow-md'>
                                <TfiCheck className='text-white w-3/4 h-3/4'/>
                            </button>
                            <button aria-label='deny' className='w-6 h-6 bg-rose-600 hover:bg-rose-700 flex justify-center items-center rounded-full transition hover:shadow-md'>
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