'use client';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className='flex flex-col overflow-auto text-lg'>
      <Link
        href='/assets'
        className={clsx({
          'px-4 py-3 font-sans': true,
          'bg-black text-white': pathname === '/assets',
        })}
      >
        Assets
      </Link>
      <Link
        href='/dummy'
        className={clsx({
          'px-4 py-3 font-sans': true,
          'bg-black text-white': pathname === '/dummy',
        })}
      >
        Dummy
      </Link>
      <Link
        href='/posts'
        className={clsx({
          'px-4 py-3 font-sans': true,
          'bg-black text-white': pathname.startsWith('/posts'),
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
    </div>
  );
}

export default Sidebar;
