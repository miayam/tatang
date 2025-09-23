'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import SpaceCreator from '../interactive/SpaceCreator';

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className='flex flex-col overflow-auto text-lg'>
      <Link
        href='/spaces/1'
        className={clsx({
          'px-4 py-3 font-sans': true,
          'bg-black text-white': pathname === '/spaces/1',
        })}
      >
        Assets
      </Link>
      <Link
        href='/spaces/2'
        className={clsx({
          'px-4 py-3 font-sans': true,
          'bg-black text-white': pathname === '/spaces/2',
        })}
      >
        Dummy
      </Link>
      <Link
        href='/spaces/3'
        className={clsx({
          'px-4 py-3 font-sans': true,
          'bg-black text-white': pathname === '/spaces/3',
        })}
      >
        Posts
      </Link>

      <Link
        href='/'
        className={clsx({
          'px-4 py-3 font-sans': true,
          'bg-black text-white': pathname === '/',
        })}
      >
        Home
      </Link>
      <SpaceCreator />
    </div>
  );
}

export default Sidebar;
