'use client';

import logout from '@/app/actions/logout';
import Messages from '@/features/Messages';

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
        <Messages />
      </section>
    </main>
  );
}
