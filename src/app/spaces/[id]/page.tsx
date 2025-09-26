'use client';

import logout from '@/app/actions/logout';
import CreateMessage from '@/features/CreateMessage';
import MessageList from '@/features/MessageList';

export default function Page() {
  return (
    <main>
      <section>
        <h1 className='text-5xl font-bold'>Space</h1>
        <button
          onClick={() => logout()}
          type='button'
          className='underline cursor-pointer'
        >
          Logout
        </button>
        <MessageList />
        <CreateMessage />
      </section>
    </main>
  );
}
