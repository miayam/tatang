'use client';

import logout from '@/app/actions/logout';

export default function Page() {
  return (
    <main>
      <section className='grid place-content-center h-full'>
        <h1 className='text-5xl font-bold'>Spaces</h1>
        <button
          onClick={() => logout()}
          type='button'
          className='underline cursor-pointer'
        >
          Logout
        </button>
      </section>
    </main>
  );
}
