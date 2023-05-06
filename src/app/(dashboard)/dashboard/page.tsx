import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

interface pageProps {}

const Dashboard = async ({}) => {

  const session = await getServerSession(authOptions)

  return (
    <pre>
        {JSON.stringify(session)}
    </pre>
  )
}

export default Dashboard