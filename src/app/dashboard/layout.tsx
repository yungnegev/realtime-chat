import { authOptions } from '@/lib/auth';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import imgSrc from '../../../public/logo.svg';
import { FiUserPlus } from 'react-icons/fi';
import { IconType } from 'react-icons';
import SignOutButton from '@/components/SignOutButton';
import FriendRequestSidebarOptions from '@/components/FriendRequestSidebarOptions';
import { fetchRedis } from '@/lib/redisHelperFunctionInApi';
import { getFriendsHelper } from '@/lib/getFriendsHelper';
import SidebarChatList from '@/components/SidebarChatList';
import MobileChatLayout from '@/components/MobileChatLayout';

interface LayoutProps {
  children: ReactNode;
}

interface SidebarOptions {
  id: number;
  name: string;
  href: string;
  icon: IconType;
}

const sidebarOptions: SidebarOptions[] = [
  {
    id: 1,
    name: 'Add Friend',
    href: '/dashboard/add',
    icon: FiUserPlus,
  },
];

const layout = async ({ children }: LayoutProps) => {
  const session = await getServerSession(authOptions);
  // this is not the main solution, we will use middleware to protect the sensitive routes
  if (!session) notFound();

  // get the friends list
  const friends = await getFriendsHelper(session.user.id);

  // since this is a server compontent we are interacting directly with the database (redis) using our helper function
  // we need to know that smembers is giving us back an array so after we fetch it we need to cast it to User[], and get its length
  const unseenRequestCount = (
    (await fetchRedis(
      'smembers',
      `user:${session.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  return (
    <div className='flex w-full h-screen'>
      <div className='md:hidden'>
        <MobileChatLayout friends={friends} session={session} unseenRequestCount={unseenRequestCount}/>
      </div>
      <div className='hidden md:flex flex-col h-full w-full max-w-xs grow gap-5 overflow-y-auto border-r border-gray-300 bg-white px-6'>
        <Link href='/dashboard' className='flex items-center shrink-0 h-16'>
          <Image
            src={imgSrc}
            alt='logo'
            className='h-8 w-auto'
            width={40}
            height={40}
          />
        </Link>

        {friends.length > 0 && (
          <span className='text-xs font-semibold leading-6 text-gray-400 tracking-wider'>
            YOUR CONVERSATIONS
          </span>
        )}

        <nav className='flex flex-1 flex-col'>
          <ul role='list' className='flex flex-1 flex-col gap-7'>
            <li>
              <SidebarChatList friends={friends} sessionId={session.user.id} />
            </li>
            <li>
              <span className='text-xs font-semibold leading-6 text-gray-400 tracking-wider'>
                OVERVIEW
              </span>
              <ul role='list' className='-mx-2 mt-2 space-y-1'>
                {sidebarOptions.map((option) => {
                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group 
                                                          flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      >
                        <span
                          className='text-gray-400 border-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 
                                        shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'
                        >
                          <option.icon className='h-4 w-4' />
                        </span>
                        <span className='truncate'>{option.name}</span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <FriendRequestSidebarOptions
                    sessionId={session.user.id}
                    initialUnseenRequestCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>
            <li className='-mx-6 mt-auto flex items-center'>
              <div className='flex flex-1 items-center gap-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900'>
                <div className='relative h-8 w-8 bg-gray-50'>
                  <Image
                    fill
                    referrerPolicy='no-referrer'
                    className='rounded-full'
                    src={session.user.image || ''}
                    alt='user'
                  />
                </div>
                <span className='sr-only'>Your profile</span>
                <div className='flex flex-col '>
                  <span aria-hidden='true'>{session.user.name}</span>
                  <span
                    aria-hidden='true'
                    className='text-xs text-zinc-400 truncate w-36 tracking-wide'
                  >
                    {session.user.email}
                  </span>
                </div>
              </div>
              <SignOutButton className='aspect-square h-full' />
            </li>
          </ul>
        </nav>
      </div>
      {children}
    </div>
  );
};

export default layout;
