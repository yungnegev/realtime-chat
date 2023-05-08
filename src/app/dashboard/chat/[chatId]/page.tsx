
// the way dynamic pages work is that they provide you with params in your props, very chill 

import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

// whatever the name of the folder is, is the name of the param
interface ChatProps {
  params: {
    chatId: string
  }
}

const Chat = async ({params}:ChatProps) => {
  
  const chatId = params.chatId
  const session = await getServerSession(authOptions)
  if (!session) notFound()

  const user = session.user

  
  return (
    <div>
      wagwan
    </div>
  )
}

export default Chat