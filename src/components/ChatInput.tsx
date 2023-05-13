'use client'

import { useRef, useState } from 'react'
import TextAreaAutosize from 'react-textarea-autosize' // for multiline textareas very nice self expanding
import Button from './ui/Button'
import { BsFillSendFill } from 'react-icons/bs'
import axios from 'axios'
import { toast } from 'react-hot-toast'

interface ChatInputProps {
    chatPartner: User
    chatId: string
}

const ChatInput = ({ chatPartner, chatId }:ChatInputProps) => {

  const [isLoading, setIsLoading] = useState<boolean>(false) 
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  // controlled input to the extarea, like one would do with redux but just with normal state
  const [input, setInput] = useState<string>('')

  const sendMessage = async () => {
    if (!input) return
    setIsLoading(true)
    try {
        await axios.post('/api/messages/send', {text: input, chatId})
        setInput('')
        // to re focus the textearea after sending a message 
        textareaRef.current?.focus() 
    } catch (error) {
        toast.error('Something went wrong') 
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className='border-t border-gray-300 px-4 pt-4 mb-2 sm:mb-0'>
      <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 
                      ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
        <TextAreaAutosize 
            ref={textareaRef} 
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                }
            }} 
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${chatPartner.name}`}
            className='block w-full p-2 border-0 bg-transparent resize-none text-gray-900 placeholder:text-gray-400 placeholder:text-sm placeholder:font-thin focus:ring-0 sm:py-1.5 sm:leading-6'
            />
        <div onClick={() => textareaRef.current?.focus()} className='py-2'>
          <div className='py-px '>
            <div className='h-9' />
          </div>
        </div>

        <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
            <div className='flex-shrink-0 '>
                <Button 
                    variant='ghost' 
                    className='focus:ring-0 focus:ring-offset-0' 
                    onClick={sendMessage}
                    isLoading={isLoading}
                    >
                    {!isLoading && <BsFillSendFill className='text-indigo-600' size={24} />}
                </Button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput