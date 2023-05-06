'use client'

import { addFriendValidator } from '@/lib/validations/add-friend'
import Button from './ui/Button'
import { MdPersonAddAlt1 } from 'react-icons/md'
import axios, { AxiosError } from 'axios'
import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const AddFriendButton = () => {
  
  // this makes sure that the type of the form data (an inbuilt js object for working with forms) is the same as the type of the validator  
  type FormData = z.infer<typeof addFriendValidator> 

  // deconstructing the useForm hook, which returns a bunch of stuff, but we only need these four things
  // register is a function that registers the input fields with the form
  // zodResolver is a function that validates the input fields with the validator ({we pass it in as an argument})
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator)
  })
  
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false)

  // on submit we will run this async funciton
  const addFriend = async (email: string) => {
    try {
        // we take email from the argument and pass it into the validator
        // if it is valid, then we will get the validated email back
        // and use the validated email to make the post request
        const validatedEmail = addFriendValidator.parse({ email }) 

        await axios.post('/api/friends/add', {
            email: validatedEmail,
        })

        setShowSuccessState(true)
    } catch (error) {
        // if the error is a zod error, then we will set the error message to the error message
        if (error instanceof z.ZodError) {
            setError('email', {message: error.message})
            return
        }
        // if the error is an axios error, then we will set the error message to the response . error data
        if (error instanceof AxiosError) {
            setError('email', {message: error.response?.data})
            return
        }
        // if its neither of the above, then something general went wrong
        setError('email', {message: 'Something went wrong'})
    }
  }

  // this function will receive the form data from the react-hook-form handleSubmit() function
  // which in turn will run the addFriend function with just the email from the data, a sort of middle step, not necessarily very necessary :)
  const onSubmit = (data: FormData) => {
    addFriend(data.email)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='max-w-sm'>
        <label 
            className='block text-sm font-medium leading-6 text-gray-900'
            htmlFor='email'
            >
                Search by email
        </label>
        <div className='mt-2 flex gap-4'>
            <input
                {...register('email')}
                placeholder='you@example.com' 
                type='text' 
                className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset 
                         ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-indigo-600 
                           sm:text-sm  sm:leading-6' 
            />
            <Button>
                <MdPersonAddAlt1 size={24} />
            </Button>
        </div>
        {/* if there is an error, then we will show the error message */}
        <span className='mt-1 text-sm text-red-600'>{ errors.email?.message }</span>
        {   // if showSuccessState is true, then we will show the success message
            showSuccessState && <span className='mt-1 text-sm text-green-600'>Friend added!</span>
        }
    </form>
  )
}

export default AddFriendButton