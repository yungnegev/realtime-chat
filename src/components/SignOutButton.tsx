'use client'

import { ButtonHTMLAttributes, useState } from "react"
import Button from "./ui/Button"
import { signOut } from "next-auth/react"
import toast from "react-hot-toast"
import { TbLoader2 } from 'react-icons/tb'
import { FiLogOut } from 'react-icons/fi'

// this is how you explain to typesript that this button should have all the atrributes that a normal button has
interface SignOutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{}

const SignOutButton = ({...props}:SignOutButtonProps) => {

  const [signingOut, setSigningOut] = useState<boolean>(false)  
    
  return (
    <Button 
        {...props} 
        variant='ghost'
        onClick={async () => {
            setSigningOut(true)
            try {
                signOut()
            } catch {
                toast.error('There was a problem signing out.')
            } finally {
                setSigningOut(false)
            }
        }}
        >
            {
                signingOut 
                    ?   <TbLoader2 className='animate-spin h-4 w-4'/>
                    :   <FiLogOut className='w-4 h-4' />
            }
    </Button>
  )
}

export default SignOutButton