import { chatHrefConstructor, cn } from '@/lib/utils'
import Image from 'next/image'
import { toast, type Toast } from 'react-hot-toast'

interface UnseenToastProps {
    t: Toast
    sessionId: string
    senderId: string
    senderImg: string
    senderName: string
    senderMessage: string
}

const UnseenToast = ({ t, sessionId, senderId, senderImg, senderName, senderMessage }:UnseenToastProps) => {
  return (
    <div className={cn('max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5', 
    {
        'animate-enter': t.visible,
        'animate-leave': !t.visible,
    }
    )}>
        <a 
          href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`}
          onClick={() => toast.dismiss(t.id)}
          className='flex-1 w-0 p-4'
          >
            <div className='flex items-start'>
                <div className='flex-shrink-0 pt-0.5'>
                    <div className='relative h-10 w-10'>
                        <Image alt='profile' src={senderImg} fill referrerPolicy='no-referrer' className='rounded-full'/>
                    </div>
                </div>
                <div className='ml-3 flex-1'>
                    <p className='text-sm font-md text-gray-900'>{senderName}</p>
                    <p className='mt-1 text-sm text-gray-500'>{senderMessage}</p>
                </div>
            </div>
        </a>
        <div className='flex border-l border-gray-200'>
            <button 
                onClick={() => toast.dismiss(t.id)}
                className='w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium 
                        text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                >
                    close
            </button>
        </div>
    </div>
  )
}

export default UnseenToast