'use client' // sheesh


import { FC, useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { signIn } from 'next-auth/react'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import imgSrc from '../../../public/logo.svg'


const Login: FC = () => {

  const [loading, setLoading] = useState<boolean>(false)

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
        await signIn('google')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
        setLoading(false)
    }
  } 
 
  return (
    <>
    <div className='flex justify-center items-center min-h-full py-12 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col w-full items-center max-w-md space-y-8'>
            <div className='flex flex-col items-center gap-8'>
              <Image src={imgSrc} alt='logo' className='h-8 w-auto' width={48} height={48} />
                <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
                    Sign in to your account
                </h2>
            </div>
            <Button 
                className='max-w-sm mx-auto w-full'
                isLoading={loading}
                type='button'
                onClick={loginWithGoogle}
                >
                {!loading && <FcGoogle size={30}/>}
            </Button>
        </div>
    </div>
    </>
  )
}

export default Login